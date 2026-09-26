# COMANDO - not_x32.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\linux_like\linux\gnu\b64\x86_64\not_x32.rs
**SHA:** 414d14164e09f0d6
**Timestamp:** 2026-08-28T02:34:44.068818
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SYS_timer_getoverrun: c_long = 225;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::prelude::*;

s! {
    pub struct statvfs {
        pub f_bsize: c_ulong,
        pub f_frsize: c_ulong,
        pub f_blocks: crate::fsblkcnt_t,
        pub f_bfree: crate::fsblkcnt_t,
        pub f_bavail: crate::fsblkcnt_t,
        pub f_files: crate::fsfilcnt_t,
        pub f_ffree: crate::fsfilcnt_t,
        pub f_favail: crate::fsfilcnt_t,
        pub f_fsid: c_ulong,
        pub f_flag: c_ulong,
        pub f_namemax: c_ulong,
        __f_spare: [c_int; 6],
    }
}

pub const __SIZEOF_PTHREAD_MUTEX_T: usize = 40;
pub const __SIZEOF_PTHREAD_RWLOCK_T: usize = 56;
pub const __SIZEOF_PTHREAD_BARRIER_T: usize = 32;

// Syscall table

pub const SYS_read: c_long = 0;
pub const SYS_write: c_long = 1;
pub const SYS_open: c_long = 2;
pub const SYS_close: c_long = 3;
pub const SYS_stat: c_long = 4;
pub const SYS_fstat: c_long = 5;
pub const SYS_lstat: c_long = 6;
pub const SYS_poll: c_long = 7;
pub const SYS_lseek: c_long = 8;
pub const SYS_mmap: c_long = 9;
pub const SYS_mprotect: c_long = 10;
pub const SYS_munmap: c_long = 11;
pub const SYS_brk: c_long = 12;
pub const SYS_rt_sigaction: c_long = 13;
pub const SYS_rt_sigprocmask: c_long = 14;
pub const SYS_rt_sigreturn: c_long = 15;
pub const SYS_ioctl: c_long = 16;
pub const SYS_pread64: c_long = 17;
pub const SYS_pwrite64: c_long = 18;
pub const SYS_readv: c_long = 19;
pub const SYS_writev: c_long = 20;
pub const SYS_access: c_long = 21;
pub const SYS_pipe: c_long = 22;
pub const SYS_select: c_long = 23;
pub const SYS_sched_yield: c_long = 24;
pub const SYS_mremap: c_long = 25;
pub const SYS_msync: c_long = 26;
pub const SYS_mincore: c_long = 27;
pub const SYS_madvise: c_long = 28;
pub const SYS_shmget: c_long = 29;
pub const SYS_shmat: c_long = 30;
pub const SYS_shmctl: c_long = 31;
pub const SYS_dup: c_long = 32;
pub const SYS_dup2: c_long = 33;
pub const SYS_pause: c_long = 34;
pub const SYS_nanosleep: c_long = 35;
pub const SYS_getitimer: c_long = 36;
pub const SYS_alarm: c_long = 37;
pub const SYS_setitimer: c_long = 38;
pub const SYS_getpid: c_long = 39;
pub const SYS_sendfile: c_long = 40;
pub const SYS_socket: c_long = 41;
pub const SYS_connect: c_long = 42;
pub const SYS_accept: c_long = 43;
pub const SYS_sendto: c_long = 44;
pub const SYS_recvfrom: c_long = 45;
pub const SYS_sendmsg: c_long = 46;
pub const SYS_recvmsg: c_long = 47;
pub const SYS_shutdown: c_long = 48;
pub const SYS_bind: c_long = 49;
pub const SYS_listen: c_long = 50;
pub const SYS_getsockname: c_long = 51;
pub const SYS_getpeername: c_long = 52;
pub const SYS_socketpair: c_long = 53;
pub const SYS_setsockopt: c_long = 54;
pub const SYS_getsockopt: c_long = 55;
pub const SYS_clone: c_long = 56;
pub const SYS_fork: c_long = 57;
pub const SYS_vfork: c_long = 58;
pub const SYS_execve: c_long = 59;
pub const SYS_exit: c_long = 60;
pub const SYS_wait4: c_long = 61;
pub const SYS_kill: c_long = 62;
pub const SYS_uname: c_long = 63;
pub const SYS_semget: c_long = 64;
pub const SYS_semop: c_long = 65;
pub const SYS_semctl: c_long = 66;
pub const SYS_shmdt: c_long = 67;
pub const SYS_msgget: c_long = 68;
pub const SYS_msgsnd: c_long = 69;
pub const SYS_msgrcv: c_long = 70;
pub const SYS_msgctl: c_long = 71;
pub const SYS_fcntl: c_long = 72;
pub const SYS_flock: c_long = 73;
pub const SYS_fsync: c_long = 74;
pub const SYS_fdatasync: c_long = 75;
pub const SYS_truncate: c_long = 76;
pub const SYS_ftruncate: c_long = 77;
pub const SYS_getdents: c_long = 78;
pub const SYS_getcwd: c_long = 79;
pub const SYS_chdir: c_long = 80;
pub const SYS_fchdir: c_long = 81;
pub const SYS_rename: c_long = 82;
pub const SYS_mkdir: c_long = 83;
pub const SYS_rmdir: c_long = 84;
pub const SYS_creat: c_long = 85;
pub const SYS_link: c_long = 86;
pub const SYS_unlink: c_long = 87;
pub const SYS_symlink: c_long = 88;
pub const SYS_readlink: c_long = 89;
pub const SYS_chmod: c_long = 90;
pub const SYS_fchmod: c_long = 91;
pub const SYS_chown: c_long = 92;
pub const SYS_fchown: c_long = 93;
pub const SYS_lchown: c_long = 94;
pub const SYS_umask: c_long = 95;
pub const SYS_gettimeofday: c_long = 96;
pub const SYS_getrlimit: c_long = 97;
pub const SYS_getrusage: c_long = 98;
pub const SYS_sysinfo: c_long = 99;
pub const SYS_times: c_long = 100;
pub const SYS_ptrace: c_long = 101;
pub const SYS_getuid: c_long = 102;
pub const SYS_syslog: c_long = 103;
pub const SYS_getgid: c_long = 104;
pub const SYS_setuid: c_long = 105;
pub const SYS_setgid: c_long = 106;
pub const SYS_geteuid: c_long = 107;
pub const SYS_getegid: c_long = 108;
pub const SYS_setpgid: c_long = 109;
pub const SYS_getppid: c_long = 110;
pub const SYS_getpgrp: c_long = 111;
pub const SYS_setsid: c_long = 112;
pub const SYS_setreuid: c_long = 113;
pub const SYS_setregid: c_long = 114;
pub const SYS_getgroups: c_long = 115;
pub const SYS_setgroups: c_long = 116;
pub const SYS_setresuid: c_long = 117;
pub const SYS_getresuid: c_long = 118;
pub const SYS_setresgid: c_long = 119;
pub const SYS_getresgid: c_long = 120;
pub const SYS_getpgid: c_long = 1
```