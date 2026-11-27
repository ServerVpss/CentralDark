//! !RASTRO: O Halo e o unico renderer do foco visual; Cua continua dono do cursor.
//! @owner: centraldark-halo-main
//! @doc_ref: docs/RELEASE.md
//! @last_updated: 2026-11-19T08:55:00Z
//! A geometria especifica de janela e validada no Windows (PID+HWND+foreground).
//! Qualquer alvo indisponivel falha fechado: nenhuma tela secundaria acende.
use crate::state::HaloTarget;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Manager, Monitor, PhysicalPosition, PhysicalSize};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Region {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}
impl Region {
    fn from_monitor(m: &Monitor) -> Self {
        let p = m.position();
        let s = m.size();
        Self {
            x: p.x,
            y: p.y,
            width: s.width,
            height: s.height,
        }
    }
    fn overlap(self, other: Self) -> u64 {
        let left = (self.x as i64).max(other.x as i64);
        let top = (self.y as i64).max(other.y as i64);
        let right = (self.x as i64 + self.width as i64).min(other.x as i64 + other.width as i64);
        let bottom = (self.y as i64 + self.height as i64).min(other.y as i64 + other.height as i64);
        if right <= left || bottom <= top {
            0
        } else {
            ((right - left) * (bottom - top)) as u64
        }
    }
    fn origin(self) -> (i32, i32) {
        (
            self.x.saturating_add((self.width / 2) as i32),
            self.y.saturating_add((self.height / 3) as i32),
        )
    }
}

#[cfg(windows)]
fn live_window(pid: u32, handle: u64) -> Option<Region> {
    use windows_sys::Win32::Foundation::RECT;
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowRect, GetWindowThreadProcessId, IsIconic, IsWindow,
        IsWindowVisible,
    };
    if handle == 0 || pid == 0 {
        return None;
    }
    let hwnd = handle as *mut std::ffi::c_void;
    // Foreground gate: nao colorir um aplicativo diferente por cima de outra janela.
    unsafe {
        if IsWindow(hwnd) == 0
            || IsWindowVisible(hwnd) == 0
            || IsIconic(hwnd) != 0
            || GetForegroundWindow() != hwnd
        {
            return None;
        }
        let mut actual_pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut actual_pid);
        if actual_pid != pid {
            return None;
        }
        let mut r = RECT::default();
        if GetWindowRect(hwnd, &mut r) == 0
            || r.right <= r.left
            || r.bottom <= r.top
            || r.left <= -30000
            || r.top <= -30000
        {
            return None;
        }
        Some(Region {
            x: r.left,
            y: r.top,
            width: (r.right - r.left) as u32,
            height: (r.bottom - r.top) as u32,
        })
    }
}
#[cfg(not(windows))]
fn live_window(_pid: u32, _handle: u64) -> Option<Region> {
    None
}

/// !RASTRO: seleciona uma unica superficie Halo; ALL mantem comportamento legado.
pub fn selection(monitors: &[Monitor], target: &HaloTarget) -> Option<(usize, Option<Region>)> {
    match target {
        HaloTarget::All => None,
        HaloTarget::Monitor {
            x,
            y,
            width,
            height,
        } => monitors
            .iter()
            .position(|m| {
                Region::from_monitor(m)
                    == Region {
                        x: *x,
                        y: *y,
                        width: *width,
                        height: *height,
                    }
            })
            .map(|i| (i, None)),
        HaloTarget::Window { pid, hwnd } => {
            let rect = live_window(*pid, *hwnd)?;
            monitors
                .iter()
                .enumerate()
                .map(|(i, m)| (i, Region::from_monitor(m).overlap(rect)))
                .filter(|(_, area)| *area > 0)
                .max_by_key(|(_, area)| *area)
                .map(|(i, _)| (i, Some(rect)))
        }
    }
}

/// !RASTRO: acompanha o HWND ja autorizado sem alterar foco, mouse, ou aplicativo.
/// Somente a janela selecionada ganha uma moldura Halo. O restante fica oculto.
pub fn refresh_window(app: &AppHandle, target: &HaloTarget) {
    if !matches!(target, HaloTarget::Window { .. }) {
        return;
    }
    let Ok(mut monitors) = app.available_monitors() else {
        return;
    };
    monitors.sort_by_key(|m| {
        (
            m.position().x,
            m.position().y,
            m.size().width,
            m.size().height,
        )
    });
    let selected = selection(&monitors, target);
    for (i, _) in monitors.iter().enumerate() {
        let label = format!("overlay-{i}");
        if let Some(win) = app.get_webview_window(&label) {
            if let Some((which, Some(rect))) = selected {
                if which == i {
                    let positioned = win
                        .set_position(PhysicalPosition::new(rect.x, rect.y))
                        .is_ok();
                    let sized = win
                        .set_size(PhysicalSize::new(rect.width, rect.height))
                        .is_ok();
                    if positioned && sized {
                        let _ = win.set_ignore_cursor_events(true);
                        let _ = win.show();
                    } else {
                        let _ = win.hide();
                    }
                    continue;
                }
            }
            let _ = win.hide();
        }
    }
}

pub fn cursor_point(app: &AppHandle, target: &HaloTarget) -> Option<(i32, i32)> {
    let mut monitors = app.available_monitors().ok()?;
    monitors.sort_by_key(|m| {
        (
            m.position().x,
            m.position().y,
            m.size().width,
            m.size().height,
        )
    });
    match target {
        HaloTarget::All => monitors
            .iter()
            .max_by_key(|m| m.position().x)
            .map(|m| Region::from_monitor(m).origin()),
        _ => {
            let (i, window) = selection(&monitors, target)?;
            Some(
                window
                    .unwrap_or_else(|| Region::from_monitor(&monitors[i]))
                    .origin(),
            )
        }
    }
}

fn cua_path() -> Option<std::path::PathBuf> {
    if let Some(p) = std::env::var_os("HERMES_CUA_DRIVER_CMD") {
        let p: std::path::PathBuf = p.into();
        if p.is_file() {
            return Some(p);
        }
    }
    let p = std::path::PathBuf::from(std::env::var_os("LOCALAPPDATA")?)
        .join("Programs")
        .join("Cua")
        .join("cua-driver")
        .join("bin")
        .join("cua-driver.exe");
    p.is_file().then_some(p)
}

/// !RASTRO: Cua CLI nao pode abrir console nem tomar o foreground do alvo Halo.
/// @owner: centraldark-halo-main @doc_ref: docs/RELEASE.md
/// @last_updated: 2026-11-19T09:33:00Z
fn cua_command(driver: &std::path::Path) -> std::process::Command {
    let mut command = std::process::Command::new(driver);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x0800_0000); // CREATE_NO_WINDOW: mesmo Cua, sem terminal.
    }
    command
}
fn call(
    driver: &std::path::Path,
    sid: &str,
    operation: &str,
    payload: serde_json::Value,
) -> Result<(), String> {
    let mut args = payload.as_object().cloned().ok_or("CUA_PAYLOAD_INVALID")?;
    args.insert(
        "session".to_owned(),
        serde_json::Value::String(sid.to_owned()),
    );
    let answer = cua_command(driver)
        .arg("call")
        .arg(operation)
        .arg(serde_json::Value::Object(args).to_string())
        .output()
        .map_err(|e| format!("CUA_CALL_IO {operation}: {e}"))?;
    if !answer.status.success() {
        return Err(format!(
            "CUA_CALL_FAILED {operation}: {}",
            String::from_utf8_lossy(&answer.stderr)
        ));
    }
    let value: serde_json::Value = serde_json::from_slice(&answer.stdout)
        .map_err(|_| format!("CUA_RESPONSE_INVALID {operation}"))?;
    if value.get("isError").and_then(|v| v.as_bool()) == Some(true)
        || value.get("is_error").and_then(|v| v.as_bool()) == Some(true)
        || value.get("ok").and_then(|v| v.as_bool()) == Some(false)
    {
        return Err(format!("CUA_LOGICAL_ERROR {operation}"));
    }
    Ok(())
}

/// !RASTRO: pisca o cursor Cua nativo, sem overlay Hermes ou controle do mouse fisico.
pub fn start_cua_blink(point: (i32, i32), active: Arc<AtomicBool>) {
    if active
        .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
        .is_err()
    {
        log::info!("Halo Cua: piscada anterior ainda ativa");
        return;
    }
    std::thread::spawn(move || {
        let result = (|| -> Result<(), String> {
            let driver = cua_path().ok_or("CUA_DRIVER_NOT_FOUND")?;
            let status = cua_command(&driver)
                .arg("status")
                .output()
                .map_err(|e| format!("CUA_STATUS_IO: {e}"))?;
            if !status.status.success()
                || String::from_utf8_lossy(&status.stdout).contains("not running")
            {
                return Err("CUA_DRIVER_NOT_RUNNING".into());
            }
            let sid = format!(
                "centraldark-halo-{}-{}",
                std::process::id(),
                crate::state::unix_time_ms()
            );
            call(&driver, &sid, "start_session", serde_json::json!({}))?;
            let blink = (|| -> Result<(), String> {
                for cycle in 0..3 {
                    call(
                        &driver,
                        &sid,
                        "set_agent_cursor_enabled",
                        serde_json::json!({"enabled":true}),
                    )?;
                    call(
                        &driver,
                        &sid,
                        "move_cursor",
                        serde_json::json!({
                            "scope":"window","x":point.0.saturating_add(cycle*12),"y":point.1
                        }),
                    )?;
                    std::thread::sleep(Duration::from_millis(800));
                    call(
                        &driver,
                        &sid,
                        "set_agent_cursor_enabled",
                        serde_json::json!({"enabled":false}),
                    )?;
                    std::thread::sleep(Duration::from_millis(350));
                }
                Ok(())
            })();
            let cleanup = call(&driver, &sid, "end_session", serde_json::json!({}));
            blink.and(cleanup)
        })();
        match result {
            Ok(()) => log::info!("Halo Cua: 3 piscadas concluidas e sessao limpa"),
            Err(e) => log::warn!("Halo Cua: {e}"),
        }
        active.store(false, Ordering::Release);
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn overlap_is_measured_without_guessing_a_monitor() {
        let a = Region {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        };
        let b = Region {
            x: 70,
            y: 30,
            width: 100,
            height: 100,
        };
        assert_eq!(a.overlap(b), 2100);
    }
}
