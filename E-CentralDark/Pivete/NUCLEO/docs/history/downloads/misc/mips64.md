# OUTRO - mips64.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\linux_like\linux\musl\b64\mips64.rs
**SHA:** a855f49b0685e50b
**Timestamp:** 2026-08-28T02:34:44.379982
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SYS_timer_getoverrun: c_long = 5000 + 219;
- pub const ERESTART: c_int = 91;
- pub const VSTART: usize = 8;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::off_t;
use crate::prelude::*;

pub type wchar_t = i32;
pub type nlink_t = c_uint;
pub type blksize_t = i64;

pub type stat64 = stat;

s! {
    pub struct stat {
        pub st_dev: crate::dev_t,
        __pad1: Padding<[c_int; 3]>,
        pub st_ino: crate::ino_t,
        pub st_mode: crate::mode_t,
        pub st_nlink: crate::nlink_t,
        pub st_uid: crate::uid_t,
        pub st_gid: crate::gid_t,
        pub st_rdev: crate::dev_t,
        __pad2: Padding<[c_uint; 2]>,
        pub st_size: off_t,
        __pad3: Padding<c_int>,
        pub st_atime: crate::time_t,
        pub st_atime_nsec: c_long,
        pub st_mtime: crate::time_t,
        pub st_mtime_nsec: c_long,
        pub st_ctime: crate::time_t,
        pub st_ctime_nsec: c_long,
        pub st_blksize: crate::blksize_t,
        __pad4: Padding<c_uint>,
        pub st_blocks: crate::blkcnt_t,
        __pad5: Padding<[c_int; 14]>,
    }

    pub struct stack_t {
        pub ss_sp: *mut c_void,
        pub ss_size: size_t,
        pub ss_flags: c_int,
    }

    pub struct ipc_perm {
        #[cfg(musl_v1_2_3)]
        pub __key: crate::key_t,
        #[cfg(not(musl_v1_2_3))]
        #[deprecated(
            since = "0.2.173",
            note = "This field is incorrectly named and will be changed
                to __key in a future release."
        )]
        pub __ipc_perm_key: crate::key_t,
        pub uid: crate::uid_t,
        pub gid: crate::gid_t,
        pub cuid: crate::uid_t,
        pub cgid: crate::gid_t,
        pub mode: crate::mode_t,
        pub __seq: c_int,
        __pad1: Padding<c_int>,
        __unused1: Padding<c_ulong>,
        __unused2: Padding<c_ulong>,
    }

    pub struct statfs {
        pub f_type: c_ulong,
        pub f_bsize: c_ulong,
        pub f_frsize: c_ulong,
        pub f_blocks: crate::fsblkcnt_t,
        pub f_bfree: crate::fsblkcnt_t,
        pub f_files: crate::fsfilcnt_t,
        pub f_ffree: crate::fsfilcnt_t,
        pub f_bavail: crate::fsblkcnt_t,
        pub f_fsid: crate::fsid_t,
        pub f_namelen: c_ulong,
        pub f_flags: c_ulong,
        pub f_spare: [c_ulong; 5],
    }

    pub struct statfs64 {
        pub f_type: c_ulong,
        pub f_bsize: c_ulong,
        pub f_frsize: c_ulong,
        pub f_blocks: crate::fsblkcnt64_t,
        pub f_bfree: crate::fsblkcnt64_t,
        pub f_files: crate::fsfilcnt64_t,
        pub f_ffree: crate::fsfilcnt64_t,
        pub f_bavail: crate::fsblkcnt64_t,
        pub f_fsid: crate::fsid_t,
        pub f_namelen: c_ulong,
        pub f_flags: c_ulong,
        pub f_spare: [c_ulong; 5],
    }
}

pub const SIGSTKSZ: size_t = 8192;
pub const MINSIGSTKSZ: size_t = 2048;

pub const SYS_read: c_long = 5000 + 0;
pub const SYS_write: c_long = 5000 + 1;
pub const SYS_open: c_long = 5000 + 2;
pub const SYS_close: c_long = 5000 + 3;
pub const SYS_stat: c_long = 5000 + 4;
pub const SYS_fstat: c_long = 5000 + 5;
pub const SYS_lstat: c_long = 5000 + 6;
pub const SYS_poll: c_long = 5000 + 7;
pub const SYS_lseek: c_long = 5000 + 8;
pub const SYS_mmap: c_long = 5000 + 9;
pub const SYS_mprotect: c_long = 5000 + 10;
pub const SYS_munmap: c_long = 5000 + 11;
pub const SYS_brk: c_long = 5000 + 12;
pub const SYS_rt_sigaction: c_long = 5000 + 13;
pub const SYS_rt_sigprocmask: c_long = 5000 + 14;
pub const SYS_ioctl: c_long = 5000 + 15;
pub const SYS_pread64: c_long = 5000 + 16;
pub const SYS_pwrite64: c_long = 5000 + 17;
pub const SYS_readv: c_long = 5000 + 18;
pub const SYS_writev: c_long = 5000 + 19;
pub const SYS_access: c_long = 5000 + 20;
pub const SYS_pipe: c_long = 5000 + 21;
pub const SYS__newselect: c_long = 5000 + 22;
pub const SYS_sched_yield: c_long = 5000 + 23;
pub const SYS_mremap: c_long = 5000 + 24;
pub const SYS_msync: c_long = 5000 + 25;
pub const SYS_mincore: c_long = 5000 + 26;
pub const SYS_madvise: c_long = 5000 + 27;
pub const SYS_shmget: c_long = 5000 + 28;
pub const SYS_shmat: c_long = 5000 + 29;
pub const SYS_shmctl: c_long = 5000 + 30;
pub const SYS_dup: c_long = 5000 + 31;
pub const SYS_dup2: c_long = 5000 + 32;
pub const SYS_pause: c_long = 5000 + 33;
pub const SYS_nanosleep: c_long = 5000 + 34;
pub const SYS_getitimer: c_long = 5000 + 35;
pub const SYS_setitimer: c_long = 5000 + 36;
pub const SYS_alarm: c_long = 5000 + 37;
pub const SYS_getpid: c_long = 5000 + 38;
pub const SYS_sendfile: c_long = 5000 + 39;
pub const SYS_socket: c_long = 5000 + 40;
pub const SYS_connect: c_long = 5000 + 41;
pub const SYS_accept: c_long = 5000 + 42;
pub const SYS_sendto: c_long = 5000 + 43;
pub const SYS_recvfrom: c_long = 5000 + 44;
pub const SYS_sendmsg: c_long = 5000 + 45;
pub const SYS_recvmsg: c_long = 5000 + 46;
pub const SYS_shutdown: c_long = 5000 + 47;
pub const SYS_bind: c_long = 5000 + 48;
pub const SYS_listen: c_long = 5000 + 49;
pub const SYS_getsockname: c_long = 5000 + 50;
pub const SYS_getpeername: c_long = 5000 + 51;
pub const SYS_socketpair: c_long = 5000 + 52;
pub const SYS_setsockopt: c_long = 5000 + 53;
pub const SYS_gets
```