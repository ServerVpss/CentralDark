# OUTRO - arm.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\linux_like\android\b32\arm.rs
**SHA:** 9c19aeacb713b288
**Timestamp:** 2026-08-28T02:34:42.661490
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SYS_timer_getoverrun: c_long = 260;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::prelude::*;

pub type wchar_t = u32;
pub type greg_t = i32;
pub type mcontext_t = sigcontext;

s! {
    pub struct sigcontext {
        pub trap_no: c_ulong,
        pub error_code: c_ulong,
        pub oldmask: c_ulong,
        pub arm_r0: c_ulong,
        pub arm_r1: c_ulong,
        pub arm_r2: c_ulong,
        pub arm_r3: c_ulong,
        pub arm_r4: c_ulong,
        pub arm_r5: c_ulong,
        pub arm_r6: c_ulong,
        pub arm_r7: c_ulong,
        pub arm_r8: c_ulong,
        pub arm_r9: c_ulong,
        pub arm_r10: c_ulong,
        pub arm_fp: c_ulong,
        pub arm_ip: c_ulong,
        pub arm_sp: c_ulong,
        pub arm_lr: c_ulong,
        pub arm_pc: c_ulong,
        pub arm_cpsr: c_ulong,
        pub fault_address: c_ulong,
    }

    pub struct __c_anonymous_uc_sigmask_with_padding {
        pub uc_sigmask: crate::sigset_t,
        /* Android has a wrong (smaller) sigset_t on x86. */
        __padding_rt_sigset: Padding<u32>,
    }

    pub struct ucontext_t {
        pub uc_flags: c_ulong,
        pub uc_link: *mut ucontext_t,
        pub uc_stack: crate::stack_t,
        pub uc_mcontext: mcontext_t,
        pub uc_sigmask__c_anonymous_union: __c_anonymous_uc_sigmask,
        /* The kernel adds extra padding after uc_sigmask to match
         * glibc sigset_t on ARM. */
        __padding: Padding<[c_char; 120]>,
        __align: [c_longlong; 0],
        uc_regspace: [c_ulong; 128],
    }
}

s_no_extra_traits! {
    pub union __c_anonymous_uc_sigmask {
        uc_sigmask: __c_anonymous_uc_sigmask_with_padding,
        uc_sigmask64: crate::sigset64_t,
    }
}

cfg_if! {
    if #[cfg(feature = "extra_traits")] {
        impl PartialEq for __c_anonymous_uc_sigmask {
            fn eq(&self, other: &__c_anonymous_uc_sigmask) -> bool {
                unsafe { self.uc_sigmask == other.uc_sigmask }
            }
        }
        impl Eq for __c_anonymous_uc_sigmask {}
        impl hash::Hash for __c_anonymous_uc_sigmask {
            fn hash<H: hash::Hasher>(&self, state: &mut H) {
                unsafe { self.uc_sigmask.hash(state) }
            }
        }
    }
}

pub const O_DIRECT: c_int = 0x10000;
pub const O_DIRECTORY: c_int = 0x4000;
pub const O_NOFOLLOW: c_int = 0x8000;
pub const O_LARGEFILE: c_int = 0o400000;

pub const SYS_restart_syscall: c_long = 0;
pub const SYS_exit: c_long = 1;
pub const SYS_fork: c_long = 2;
pub const SYS_read: c_long = 3;
pub const SYS_write: c_long = 4;
pub const SYS_open: c_long = 5;
pub const SYS_close: c_long = 6;
pub const SYS_creat: c_long = 8;
pub const SYS_link: c_long = 9;
pub const SYS_unlink: c_long = 10;
pub const SYS_execve: c_long = 11;
pub const SYS_chdir: c_long = 12;
pub const SYS_mknod: c_long = 14;
pub const SYS_chmod: c_long = 15;
pub const SYS_lchown: c_long = 16;
pub const SYS_lseek: c_long = 19;
pub const SYS_getpid: c_long = 20;
pub const SYS_mount: c_long = 21;
pub const SYS_setuid: c_long = 23;
pub const SYS_getuid: c_long = 24;
pub const SYS_ptrace: c_long = 26;
pub const SYS_pause: c_long = 29;
pub const SYS_access: c_long = 33;
pub const SYS_nice: c_long = 34;
pub const SYS_sync: c_long = 36;
pub const SYS_kill: c_long = 37;
pub const SYS_rename: c_long = 38;
pub const SYS_mkdir: c_long = 39;
pub const SYS_rmdir: c_long = 40;
pub const SYS_dup: c_long = 41;
pub const SYS_pipe: c_long = 42;
pub const SYS_times: c_long = 43;
pub const SYS_brk: c_long = 45;
pub const SYS_setgid: c_long = 46;
pub const SYS_getgid: c_long = 47;
pub const SYS_geteuid: c_long = 49;
pub const SYS_getegid: c_long = 50;
pub const SYS_acct: c_long = 51;
pub const SYS_umount2: c_long = 52;
pub const SYS_ioctl: c_long = 54;
pub const SYS_fcntl: c_long = 55;
pub const SYS_setpgid: c_long = 57;
pub const SYS_umask: c_long = 60;
pub const SYS_chroot: c_long = 61;
pub const SYS_ustat: c_long = 62;
pub const SYS_dup2: c_long = 63;
pub const SYS_getppid: c_long = 64;
pub const SYS_getpgrp: c_long = 65;
pub const SYS_setsid: c_long = 66;
pub const SYS_sigaction: c_long = 67;
pub const SYS_setreuid: c_long = 70;
pub const SYS_setregid: c_long = 71;
pub const SYS_sigsuspend: c_long = 72;
pub const SYS_sigpending: c_long = 73;
pub const SYS_sethostname: c_long = 74;
pub const SYS_setrlimit: c_long = 75;
pub const SYS_getrusage: c_long = 77;
pub const SYS_gettimeofday: c_long = 78;
pub const SYS_settimeofday: c_long = 79;
pub const SYS_getgroups: c_long = 80;
pub const SYS_setgroups: c_long = 81;
pub const SYS_symlink: c_long = 83;
pub const SYS_readlink: c_long = 85;
pub const SYS_uselib: c_long = 86;
pub const SYS_swapon: c_long = 87;
pub const SYS_reboot: c_long = 88;
pub const SYS_munmap: c_long = 91;
pub const SYS_truncate: c_long = 92;
pub const SYS_ftruncate: c_long = 93;
pub const SYS_fchmod: c_long = 94;
pub const SYS_fchown: c_long = 95;
pub const SYS_getpriority: c_long = 96;
pub const SYS_setpriority: c_long = 97;
pub const SYS_statfs: c_long = 99;
pub const SYS_fstatfs: c_long = 100;
pub const SYS_syslog: c_long = 103;
pub const SYS_setitimer: c
```