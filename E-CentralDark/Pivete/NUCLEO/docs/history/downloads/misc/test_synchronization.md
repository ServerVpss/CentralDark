# OUTRO - test_synchronization.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\once_cell-1.21.4\examples\test_synchronization.rs
**SHA:** 88abd5c16275bb2f
**Timestamp:** 2026-08-28T02:34:53.606783
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = std::time::Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
//! Test if the OnceCell properly synchronizes.
//! Needs to be run in release mode.
//!
//! We create a `Vec` with `N_ROUNDS` of `OnceCell`s. All threads will walk the `Vec`, and race to
//! be the first one to initialize a cell.
//! Every thread adds the results of the cells it sees to an accumulator, which is compared at the
//! end.
//! All threads should end up with the same result.

use once_cell::sync::OnceCell;

const N_THREADS: usize = 32;
const N_ROUNDS: usize = 1_000_000;

static CELLS: OnceCell<Vec<OnceCell<usize>>> = OnceCell::new();
static RESULT: OnceCell<usize> = OnceCell::new();

fn main() {
    let start = std::time::Instant::now();
    CELLS.get_or_init(|| vec![OnceCell::new(); N_ROUNDS]);
    let threads =
        (0..N_THREADS).map(|i| std::thread::spawn(move || thread_main(i))).collect::<Vec<_>>();
    for thread in threads {
        thread.join().unwrap();
    }
    println!("{:?}", start.elapsed());
    println!("No races detected");
}

fn thread_main(i: usize) {
    let cells = CELLS.get().unwrap();
    let mut accum = 0;
    for cell in cells.iter() {
        let &value = cell.get_or_init(|| i);
        accum += value;
    }
    assert_eq!(RESULT.get_or_init(|| accum), &accum);
}

```