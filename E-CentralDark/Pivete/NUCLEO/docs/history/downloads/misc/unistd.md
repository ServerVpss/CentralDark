# OUTRO - unistd.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\new\newlib\unistd.rs
**SHA:** 15e74fb2c22e2343
**Timestamp:** 2026-08-28T02:34:37.653670
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const _SC_2_FORT_RUN: c_int = 111;

### Ouro Bruto (primeiros 5000 chars)
```
//! Header: `unistd.h`

pub use crate::new::common::posix::unistd::{
    STDERR_FILENO,
    STDIN_FILENO,
    STDOUT_FILENO,
};
use crate::prelude::*;

pub const _SC_ARG_MAX: c_int = 0;
pub const _SC_CHILD_MAX: c_int = 1;
pub const _SC_CLK_TCK: c_int = 2;
pub const _SC_NGROUPS_MAX: c_int = 3;
pub const _SC_OPEN_MAX: c_int = 4;
pub const _SC_JOB_CONTROL: c_int = 5;
pub const _SC_SAVED_IDS: c_int = 6;
pub const _SC_VERSION: c_int = 7;
pub const _SC_PAGESIZE: c_int = 8;
pub const _SC_PAGE_SIZE: c_int = _SC_PAGESIZE;
pub const _SC_NPROCESSORS_CONF: c_int = 9;
pub const _SC_NPROCESSORS_ONLN: c_int = 10;
pub const _SC_PHYS_PAGES: c_int = 11;
pub const _SC_AVPHYS_PAGES: c_int = 12;
pub const _SC_MQ_OPEN_MAX: c_int = 13;
pub const _SC_MQ_PRIO_MAX: c_int = 14;
pub const _SC_RTSIG_MAX: c_int = 15;
pub const _SC_SEM_NSEMS_MAX: c_int = 16;
pub const _SC_SEM_VALUE_MAX: c_int = 17;
pub const _SC_SIGQUEUE_MAX: c_int = 18;
pub const _SC_TIMER_MAX: c_int = 19;
pub const _SC_TZNAME_MAX: c_int = 20;
pub const _SC_ASYNCHRONOUS_IO: c_int = 21;
pub const _SC_FSYNC: c_int = 22;
pub const _SC_MAPPED_FILES: c_int = 23;
pub const _SC_MEMLOCK: c_int = 24;
pub const _SC_MEMLOCK_RANGE: c_int = 25;
pub const _SC_MEMORY_PROTECTION: c_int = 26;
pub const _SC_MESSAGE_PASSING: c_int = 27;
pub const _SC_PRIORITIZED_IO: c_int = 28;
pub const _SC_REALTIME_SIGNALS: c_int = 29;
pub const _SC_SEMAPHORES: c_int = 30;
pub const _SC_SHARED_MEMORY_OBJECTS: c_int = 31;
pub const _SC_SYNCHRONIZED_IO: c_int = 32;
pub const _SC_TIMERS: c_int = 33;
pub const _SC_AIO_LISTIO_MAX: c_int = 34;
pub const _SC_AIO_MAX: c_int = 35;
pub const _SC_AIO_PRIO_DELTA_MAX: c_int = 36;
pub const _SC_DELAYTIMER_MAX: c_int = 37;
pub const _SC_THREAD_KEYS_MAX: c_int = 38;
pub const _SC_THREAD_STACK_MIN: c_int = 39;
pub const _SC_THREAD_THREADS_MAX: c_int = 40;
pub const _SC_TTY_NAME_MAX: c_int = 41;
pub const _SC_THREADS: c_int = 42;
pub const _SC_THREAD_ATTR_STACKADDR: c_int = 43;
pub const _SC_THREAD_ATTR_STACKSIZE: c_int = 44;
pub const _SC_THREAD_PRIORITY_SCHEDULING: c_int = 45;
pub const _SC_THREAD_PRIO_INHERIT: c_int = 46;
pub const _SC_THREAD_PRIO_PROTECT: c_int = 47;
pub const _SC_THREAD_PRIO_CEILING: c_int = _SC_THREAD_PRIO_PROTECT;
pub const _SC_THREAD_PROCESS_SHARED: c_int = 48;
pub const _SC_THREAD_SAFE_FUNCTIONS: c_int = 49;
pub const _SC_GETGR_R_SIZE_MAX: c_int = 50;
pub const _SC_GETPW_R_SIZE_MAX: c_int = 51;
pub const _SC_LOGIN_NAME_MAX: c_int = 52;
pub const _SC_THREAD_DESTRUCTOR_ITERATIONS: c_int = 53;
pub const _SC_ADVISORY_INFO: c_int = 54;
pub const _SC_ATEXIT_MAX: c_int = 55;
pub const _SC_BARRIERS: c_int = 56;
pub const _SC_BC_BASE_MAX: c_int = 57;
pub const _SC_BC_DIM_MAX: c_int = 58;
pub const _SC_BC_SCALE_MAX: c_int = 59;
pub const _SC_BC_STRING_MAX: c_int = 60;
pub const _SC_CLOCK_SELECTION: c_int = 61;
pub const _SC_COLL_WEIGHTS_MAX: c_int = 62;
pub const _SC_CPUTIME: c_int = 63;
pub const _SC_EXPR_NEST_MAX: c_int = 64;
pub const _SC_HOST_NAME_MAX: c_int = 65;
pub const _SC_IOV_MAX: c_int = 66;
pub const _SC_IPV6: c_int = 67;
pub const _SC_LINE_MAX: c_int = 68;
pub const _SC_MONOTONIC_CLOCK: c_int = 69;
pub const _SC_RAW_SOCKETS: c_int = 70;
pub const _SC_READER_WRITER_LOCKS: c_int = 71;
pub const _SC_REGEXP: c_int = 72;
pub const _SC_RE_DUP_MAX: c_int = 73;
pub const _SC_SHELL: c_int = 74;
pub const _SC_SPAWN: c_int = 75;
pub const _SC_SPIN_LOCKS: c_int = 76;
pub const _SC_SPORADIC_SERVER: c_int = 77;
pub const _SC_SS_REPL_MAX: c_int = 78;
pub const _SC_SYMLOOP_MAX: c_int = 79;
pub const _SC_THREAD_CPUTIME: c_int = 80;
pub const _SC_THREAD_SPORADIC_SERVER: c_int = 81;
pub const _SC_TIMEOUTS: c_int = 82;
pub const _SC_TRACE: c_int = 83;
pub const _SC_TRACE_EVENT_FILTER: c_int = 84;
pub const _SC_TRACE_EVENT_NAME_MAX: c_int = 85;
pub const _SC_TRACE_INHERIT: c_int = 86;
pub const _SC_TRACE_LOG: c_int = 87;
pub const _SC_TRACE_NAME_MAX: c_int = 88;
pub const _SC_TRACE_SYS_MAX: c_int = 89;
pub const _SC_TRACE_USER_EVENT_MAX: c_int = 90;
pub const _SC_TYPED_MEMORY_OBJECTS: c_int = 91;
pub const _SC_V7_ILP32_OFF32: c_int = 92;
pub const _SC_V6_ILP32_OFF32: c_int = _SC_V7_ILP32_OFF32;
pub const _SC_XBS5_ILP32_OFF32: c_int = _SC_V7_ILP32_OFF32;
pub const _SC_V7_ILP32_OFFBIG: c_int = 93;
pub const _SC_V6_ILP32_OFFBIG: c_int = _SC_V7_ILP32_OFFBIG;
pub const _SC_XBS5_ILP32_OFFBIG: c_int = _SC_V7_ILP32_OFFBIG;
pub const _SC_V7_LP64_OFF64: c_int = 94;
pub const _SC_V6_LP64_OFF64: c_int = _SC_V7_LP64_OFF64;
pub const _SC_XBS5_LP64_OFF64: c_int = _SC_V7_LP64_OFF64;
pub const _SC_V7_LPBIG_OFFBIG: c_int = 95;
pub const _SC_V6_LPBIG_OFFBIG: c_int = _SC_V7_LPBIG_OFFBIG;
pub const _SC_XBS5_LPBIG_OFFBIG: c_int = _SC_V7_LPBIG_OFFBIG;
pub const _SC_XOPEN_CRYPT: c_int = 96;
pub const _SC_XOPEN_ENH_I18N: c_int = 97;
pub const _SC_XOPEN_LEGACY: c_int = 98;
pub const _SC_XOPEN_REALTIME: c_int = 99;
pub const _SC_STREAM_MAX: c_int = 100;
pub const _SC_PRIORITY_SCHEDULING: c_int = 101;
pub const _SC_XOPEN_REALTIME_THREADS: c_int = 102;
pub const _SC_XOPEN_SHM: c_int = 103;
p
```

---

# OUTRO - unistd.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\new\qurt\unistd.rs
**SHA:** 377331ec77889334
**Timestamp:** 2026-08-28T02:34:40.080113
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const _SC_2_FORT_RUN: c_int = 50;

### Ouro Bruto (primeiros 5000 chars)
```
//! Header: `unistd.h`

use super::*;
pub use crate::new::common::posix::unistd::{
    STDERR_FILENO,
    STDIN_FILENO,
    STDOUT_FILENO,
};
use crate::prelude::*;

// Access mode constants
pub const F_OK: c_int = 0;
pub const X_OK: c_int = 1;
pub const W_OK: c_int = 2;
pub const R_OK: c_int = 4;

// Whence constants for lseek
pub const SEEK_SET: c_int = 0;
pub const SEEK_CUR: c_int = 1;
pub const SEEK_END: c_int = 2;

// pathconf constants (from bits/confname.h)
pub const _PC_LINK_MAX: c_int = 0;
pub const _PC_MAX_CANON: c_int = 1;
pub const _PC_MAX_INPUT: c_int = 2;
pub const _PC_NAME_MAX: c_int = 3;
pub const _PC_PATH_MAX: c_int = 4;
pub const _PC_PIPE_BUF: c_int = 5;
pub const _PC_CHOWN_RESTRICTED: c_int = 6;
pub const _PC_NO_TRUNC: c_int = 7;
pub const _PC_VDISABLE: c_int = 8;
pub const _PC_SYNC_IO: c_int = 9;
pub const _PC_ASYNC_IO: c_int = 10;
pub const _PC_PRIO_IO: c_int = 11;
pub const _PC_SOCK_MAXBUF: c_int = 12;
pub const _PC_FILESIZEBITS: c_int = 13;
pub const _PC_REC_INCR_XFER_SIZE: c_int = 14;
pub const _PC_REC_MAX_XFER_SIZE: c_int = 15;
pub const _PC_REC_MIN_XFER_SIZE: c_int = 16;
pub const _PC_REC_XFER_ALIGN: c_int = 17;
pub const _PC_ALLOC_SIZE_MIN: c_int = 18;
pub const _PC_SYMLINK_MAX: c_int = 19;
pub const _PC_2_SYMLINKS: c_int = 20;

// sysconf constants (from bits/confname.h)
pub const _SC_ARG_MAX: c_int = 0;
pub const _SC_CHILD_MAX: c_int = 1;
pub const _SC_CLK_TCK: c_int = 2;
pub const _SC_NGROUPS_MAX: c_int = 3;
pub const _SC_OPEN_MAX: c_int = 4;
pub const _SC_STREAM_MAX: c_int = 5;
pub const _SC_TZNAME_MAX: c_int = 6;
pub const _SC_JOB_CONTROL: c_int = 7;
pub const _SC_SAVED_IDS: c_int = 8;
pub const _SC_REALTIME_SIGNALS: c_int = 9;
pub const _SC_PRIORITY_SCHEDULING: c_int = 10;
pub const _SC_TIMERS: c_int = 11;
pub const _SC_ASYNCHRONOUS_IO: c_int = 12;
pub const _SC_PRIORITIZED_IO: c_int = 13;
pub const _SC_SYNCHRONIZED_IO: c_int = 14;
pub const _SC_FSYNC: c_int = 15;
pub const _SC_MAPPED_FILES: c_int = 16;
pub const _SC_MEMLOCK: c_int = 17;
pub const _SC_MEMLOCK_RANGE: c_int = 18;
pub const _SC_MEMORY_PROTECTION: c_int = 19;
pub const _SC_MESSAGE_PASSING: c_int = 20;
pub const _SC_SEMAPHORES: c_int = 21;
pub const _SC_SHARED_MEMORY_OBJECTS: c_int = 22;
pub const _SC_AIO_LISTIO_MAX: c_int = 23;
pub const _SC_AIO_MAX: c_int = 24;
pub const _SC_AIO_PRIO_DELTA_MAX: c_int = 25;
pub const _SC_DELAYTIMER_MAX: c_int = 26;
pub const _SC_MQ_OPEN_MAX: c_int = 27;
pub const _SC_MQ_PRIO_MAX: c_int = 28;
pub const _SC_VERSION: c_int = 29;
pub const _SC_PAGESIZE: c_int = 30;
pub const _SC_PAGE_SIZE: c_int = _SC_PAGESIZE;
pub const _SC_RTSIG_MAX: c_int = 31;
pub const _SC_SEM_NSEMS_MAX: c_int = 32;
pub const _SC_SEM_VALUE_MAX: c_int = 33;
pub const _SC_SIGQUEUE_MAX: c_int = 34;
pub const _SC_TIMER_MAX: c_int = 35;
pub const _SC_BC_BASE_MAX: c_int = 36;
pub const _SC_BC_DIM_MAX: c_int = 37;
pub const _SC_BC_SCALE_MAX: c_int = 38;
pub const _SC_BC_STRING_MAX: c_int = 39;
pub const _SC_COLL_WEIGHTS_MAX: c_int = 40;
pub const _SC_EQUIV_CLASS_MAX: c_int = 41;
pub const _SC_EXPR_NEST_MAX: c_int = 42;
pub const _SC_LINE_MAX: c_int = 43;
pub const _SC_RE_DUP_MAX: c_int = 44;
pub const _SC_CHARCLASS_NAME_MAX: c_int = 45;
pub const _SC_2_VERSION: c_int = 46;
pub const _SC_2_C_BIND: c_int = 47;
pub const _SC_2_C_DEV: c_int = 48;
pub const _SC_2_FORT_DEV: c_int = 49;
pub const _SC_2_FORT_RUN: c_int = 50;
pub const _SC_2_SW_DEV: c_int = 51;
pub const _SC_2_LOCALEDEF: c_int = 52;
pub const _SC_PII: c_int = 53;
pub const _SC_PII_XTI: c_int = 54;
pub const _SC_PII_SOCKET: c_int = 55;
pub const _SC_PII_INTERNET: c_int = 56;
pub const _SC_PII_OSI: c_int = 57;
pub const _SC_POLL: c_int = 58;
pub const _SC_SELECT: c_int = 59;
pub const _SC_UIO_MAXIOV: c_int = 60;
pub const _SC_IOV_MAX: c_int = _SC_UIO_MAXIOV;
pub const _SC_PII_INTERNET_STREAM: c_int = 61;
pub const _SC_PII_INTERNET_DGRAM: c_int = 62;
pub const _SC_PII_OSI_COTS: c_int = 63;
pub const _SC_PII_OSI_CLTS: c_int = 64;
pub const _SC_PII_OSI_M: c_int = 65;
pub const _SC_T_IOV_MAX: c_int = 66;
pub const _SC_THREADS: c_int = 67;
pub const _SC_THREAD_SAFE_FUNCTIONS: c_int = 68;
pub const _SC_GETGR_R_SIZE_MAX: c_int = 69;
pub const _SC_GETPW_R_SIZE_MAX: c_int = 70;
pub const _SC_LOGIN_NAME_MAX: c_int = 71;
pub const _SC_TTY_NAME_MAX: c_int = 72;
pub const _SC_THREAD_DESTRUCTOR_ITERATIONS: c_int = 73;
pub const _SC_THREAD_KEYS_MAX: c_int = 74;
pub const _SC_THREAD_STACK_MIN: c_int = 75;
pub const _SC_THREAD_THREADS_MAX: c_int = 76;
pub const _SC_THREAD_ATTR_STACKADDR: c_int = 77;
pub const _SC_THREAD_ATTR_STACKSIZE: c_int = 78;
pub const _SC_THREAD_PRIORITY_SCHEDULING: c_int = 79;
pub const _SC_THREAD_PRIO_INHERIT: c_int = 80;
pub const _SC_THREAD_PRIO_PROTECT: c_int = 81;
pub const _SC_THREAD_PROCESS_SHARED: c_int = 82;
pub const _SC_NPROCESSORS_CONF: c_int = 83;
pub const _SC_NPROCESSORS_ONLN: c_int = 84;
pub const _SC_PHYS_PAGES: c_int = 85;
pub const _SC_AVPHYS_PAGES: c_int = 86;
pub const _SC_ATEXIT_MAX: c_int = 87;
pub const _SC_PASS_MAX: c_int = 88;
pu
```