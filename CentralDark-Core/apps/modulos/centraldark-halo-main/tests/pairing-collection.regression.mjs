// Regression for concurrent native pairing status collection.
// Run with Node and Cargo using the toolchain's existing crate cache. Windows: use a Visual Studio developer terminal.
// Optional argument: point to a different session_vault.rs to compare against the pre-fix baseline.
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const sourcePath = process.argv[2] ? resolve(process.argv[2]) : new URL('../src-tauri/src/session_vault.rs', import.meta.url);
const source = readFileSync(sourcePath, 'utf8').replaceAll('\r\n', '\n');
function extract(first, last, from = 0) {
  const begin = source.indexOf(first, from);
  const end = source.indexOf(last, begin + first.length);
  if (begin < 0 || end < 0) throw new Error('Pairing source anchor changed: ' + first);
  return source.slice(begin, end);
}
const pairing = extract('struct PendingRemotePair', '\n}') + '\n}';
const mutex = source.includes('static PAIRING_FLOW_LOCK:') ? extract('static PAIRING_FLOW_LOCK:', 'static PENDING_REMOTE_PAIR:') : '';
const state = extract('static PENDING_REMOTE_PAIR:', '\n');
const ipc = extract('async fn remote_pairing_status_impl', '/// !RASTRO: concluir').replace('#[tauri::command]\n', '');
const fixtures = String.raw`
#![allow(dead_code)]
use serde_json::{json,Value};
use std::sync::{Mutex as PairMutex,atomic::{AtomicUsize,Ordering::SeqCst}};
extern crate self as tauri;
pub mod async_runtime { pub use tokio::sync::Mutex; }
pub struct WebviewWindow(&'static str);
fn require_control_window(w:&WebviewWindow)->Result<(),String>{if w.0=="invalid-window"{Err("FORBIDDEN".into())}else{Ok(())}}
fn native_owner(w:&WebviewWindow)->Result<Value,String>{if w.0.is_empty(){Err("NO_LOGIN".into())}else{Ok(json!({"user":{"id":w.0}}))}}
static N:AtomicUsize=AtomicUsize::new(0);
static SAVES:AtomicUsize=AtomicUsize::new(0);
static FAIL_HEARTBEAT:AtomicUsize=AtomicUsize::new(0);
static MODE:AtomicUsize=AtomicUsize::new(0);
static VAULT:PairMutex<Option<Value>>=PairMutex::new(None);
const DEVICE_REPAIR_REQUIRED:&str="DEVICE_REPAIR_REQUIRED";
mod logging{pub fn diag(_: &str,_: &str,_: &str){}}
async fn remote_pairing_status(w:WebviewWindow)->Result<Value,String>{remote_pairing_status_impl(w).await}
fn load_device_auth()->Result<Option<Value>,String>{Ok(VAULT.lock().unwrap().clone())}
fn save_device_auth(a:&Value)->Result<(),String>{SAVES.fetch_add(1,SeqCst);*VAULT.lock().unwrap()=Some(a.clone());Ok(())}
async fn verify_native_device(a:Value)->Result<Value,String>{if FAIL_HEARTBEAT.swap(0,SeqCst)==1{return Err("HEARTBEAT_TRANSIENT".into());}Ok(json!({"state":"PAIRED_VERIFIED","deviceId":a["device_id"]}))}
async fn device_post(path:&str,b:&Value,_:Option<&str>)->Result<Value,String>{
 if path=="/pair/start"{return Ok(json!({"ok":true,"pair_id":"p","pair_secret":"fixture","code":"fixture","expires_at":"fixture"}));}
 assert_eq!(path,"/pair/status");assert_eq!(b["id"],"p");
 match MODE.load(SeqCst){1=>return Err("NETWORK".into()),2=>return Ok(json!({"status":"pending"})),3=>return Ok(json!({"status":"approved"})),_=>{}}
 if N.fetch_add(1,SeqCst)==0{
 tokio::time::sleep(std::time::Duration::from_millis(40)).await;
 return Ok(json!({"status":"approved","token":"fixture","refresh_token":"fixture","device_id":"d1"}));}
 Ok(json!({"status":"approved"}))
}
`;
const assertions = String.raw`
#[tokio::main(flavor="current_thread")]
async fn main(){
 assert_eq!(remote_pairing_status_impl(WebviewWindow("invalid-window")).await.unwrap_err(),"FORBIDDEN");
 assert_eq!(start_remote_pairing(WebviewWindow("")).await.unwrap_err(),"NO_LOGIN");
 assert_eq!(start_remote_pairing(WebviewWindow("a")).await.unwrap()["state"],"WAITING_OWNER_CONSENT");
 MODE.store(1,SeqCst);
 assert_eq!(remote_pairing_status_impl(WebviewWindow("a")).await.unwrap_err(),"NETWORK");
 MODE.store(2,SeqCst);
 assert_eq!(remote_pairing_status_impl(WebviewWindow("a")).await.unwrap()["state"],"WAITING_OWNER_CONSENT");
 MODE.store(3,SeqCst);
 assert_eq!(remote_pairing_status_impl(WebviewWindow("a")).await.unwrap_err(),"PAIRING_APPROVED_TOKEN_INCOMPLETE");
 assert!(load_device_auth().unwrap().is_none());
 MODE.store(0,SeqCst);
 FAIL_HEARTBEAT.store(1,SeqCst);
 let (a,b)=tokio::join!(remote_pairing_status_impl(WebviewWindow("a")),remote_pairing_status_impl(WebviewWindow("a")));
 assert_eq!(a.unwrap()["state"],"TOKEN_SAVED_HEARTBEAT_PENDING");
 assert_eq!(N.load(SeqCst),1,"duplicate upstream collection");
 assert_eq!(SAVES.load(SeqCst),1);
 assert_eq!(b.unwrap()["state"],"PAIRED_VERIFIED");
 assert_eq!(load_device_auth().unwrap().unwrap()["device_id"],"d1");
 assert_eq!(remote_pairing_status_impl(WebviewWindow("b")).await.unwrap_err(),"DEVICE_BELONGS_TO_ANOTHER_ACCOUNT");
 assert_eq!(start_remote_pairing(WebviewWindow("a")).await.unwrap()["state"],"PAIRED_VERIFIED");
 assert_eq!(N.load(SeqCst),1);
 println!("PASS: one collection/save, heartbeat recovered by second caller; owner/window denied; vault preserved; pending/network/incomplete distinguished");
}
`;
const sandbox = mkdtempSync(join(tmpdir(), 'centraldark-c15-'));
try {
  writeFileSync(join(sandbox, 'Cargo.toml'), "[package]\nname = \"centraldark-pairing-regression\"\nversion = \"0.0.0\"\nedition = \"2021\"\n[dependencies]\nserde_json = \"1\"\ntokio = { version = \"1\", features = [\"rt\", \"macros\", \"time\", \"sync\"] }\n[[bin]]\nname = \"pairing-regression\"\npath = \"regression.rs\"\n");
  writeFileSync(join(sandbox, 'regression.rs'), [fixtures, '#[derive(Clone)]', pairing, mutex, state, ipc, assertions].join('\n'));
  const run = spawnSync('cargo', ['run', '--offline', '--quiet'], { cwd: sandbox, stdio: 'inherit', env: { ...process.env, CARGO_TARGET_DIR: join(sandbox, 'target') }, timeout: 180_000 });
  if (run.error) throw run.error;
  process.exitCode = run.status ?? 1;
} finally {
  rmSync(sandbox, { recursive: true, force: true });
}
