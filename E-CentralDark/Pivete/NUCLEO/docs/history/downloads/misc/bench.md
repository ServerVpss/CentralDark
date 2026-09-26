# OUTRO - bench.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\once_cell-1.21.4\examples\bench.rs
**SHA:** 1597a52529f75d6c
**Timestamp:** 2026-08-28T02:34:53.499398
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = std::time::Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use std::mem::size_of;

use once_cell::sync::OnceCell;

const N_THREADS: usize = 32;
const N_ROUNDS: usize = 100_000_000;

static CELL: OnceCell<usize> = OnceCell::new();

fn main() {
    let start = std::time::Instant::now();
    let threads =
        (0..N_THREADS).map(|i| std::thread::spawn(move || thread_main(i))).collect::<Vec<_>>();
    for thread in threads {
        thread.join().unwrap();
    }
    println!("{:?}", start.elapsed());
    println!("size_of::<OnceCell<()>>()   = {:?}", size_of::<OnceCell<()>>());
    println!("size_of::<OnceCell<bool>>() = {:?}", size_of::<OnceCell<bool>>());
    println!("size_of::<OnceCell<u32>>()  = {:?}", size_of::<OnceCell<u32>>());
}

fn thread_main(i: usize) {
    for _ in 0..N_ROUNDS {
        let &value = CELL.get_or_init(|| i);
        assert!(value < N_THREADS)
    }
}

```