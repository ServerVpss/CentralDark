# OUTRO - stopwatch.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crossbeam-channel-0.5.16\examples\stopwatch.rs
**SHA:** d02121258f08d56f
**Timestamp:** 2026-08-28T02:33:32.455306
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
//! Prints the elapsed time every 1 second and quits on Ctrl+C.

#[cfg(windows)] // signal_hook::iterator does not work on windows
fn main() {
    println!("This example does not work on Windows");
}

#[cfg(not(windows))]
fn main() {
    use std::io;
    use std::thread;
    use std::time::{Duration, Instant};

    use crossbeam_channel::{bounded, select, tick, Receiver};
    use signal_hook::consts::SIGINT;
    use signal_hook::iterator::Signals;

    // Creates a channel that gets a message every time `SIGINT` is signalled.
    fn sigint_notifier() -> io::Result<Receiver<()>> {
        let (s, r) = bounded(100);
        let mut signals = Signals::new(&[SIGINT])?;

        thread::spawn(move || {
            for _ in signals.forever() {
                if s.send(()).is_err() {
                    break;
                }
            }
        });

        Ok(r)
    }

    // Prints the elapsed time.
    fn show(dur: Duration) {
        println!("Elapsed: {}.{:03} sec", dur.as_secs(), dur.subsec_millis());
    }

    let start = Instant::now();
    let update = tick(Duration::from_secs(1));
    let ctrl_c = sigint_notifier().unwrap();

    loop {
        select! {
            recv(update) -> _ => {
                show(start.elapsed());
            }
            recv(ctrl_c) -> _ => {
                println!();
                println!("Goodbye!");
                show(start.elapsed());
                break;
            }
        }
    }
}

```