# OUTRO - powerpc.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\linux_like\linux\gnu\b32\powerpc.rs
**SHA:** 585983c6617a590e
**Timestamp:** 2026-08-28T02:34:43.275816
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub l_start: off_t,
- pub l_start: off64_t,
- pub const ERESTART: c_int = 85;
- pub const VSTART: usize = 0xd;
- pub const SYS_timer_getoverrun: c_long = 243;
- pub const SYS_spu_run: c_long = 278;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::prelude::*;
use crate::{
    off64_t,
    off_t,
};

pub type wchar_t = i32;

s! {
    // FIXME(1.0): This should not implement `PartialEq`
    #[allow(unpredictable_function_pointer_comparisons)]
    pub struct sigaction {
        pub sa_sigaction: crate::sighandler_t,
        pub sa_mask: crate::sigset_t,
        pub sa_flags: c_int,
        pub sa_restorer: Option<extern "C" fn()>,
    }

    pub struct statfs {
        pub f_type: crate::__fsword_t,
        pub f_bsize: crate::__fsword_t,
        pub f_blocks: crate::fsblkcnt_t,
        pub f_bfree: crate::fsblkcnt_t,
        pub f_bavail: crate::fsblkcnt_t,

        pub f_files: crate::fsfilcnt_t,
        pub f_ffree: crate::fsfilcnt_t,
        pub f_fsid: crate::fsid_t,

        pub f_namelen: crate::__fsword_t,
        pub f_frsize: crate::__fsword_t,
        pub f_flags: crate::__fsword_t,
        f_spare: [crate::__fsword_t; 4],
    }

    pub struct flock {
        pub l_type: c_short,
        pub l_whence: c_short,
        pub l_start: off_t,
        pub l_len: off_t,
        pub l_pid: crate::pid_t,
    }

    pub struct flock64 {
        pub l_type: c_short,
        pub l_whence: c_short,
        pub l_start: off64_t,
        pub l_len: off64_t,
        pub l_pid: crate::pid_t,
    }

    pub struct ipc_perm {
        __key: crate::key_t,
        pub uid: crate::uid_t,
        pub gid: crate::gid_t,
        pub cuid: crate::uid_t,
        pub cgid: crate::gid_t,
        pub mode: crate::mode_t,
        __seq: u32,
        __pad1: Padding<u32>,
        __glibc_reserved1: Padding<u64>,
        __glibc_reserved2: Padding<u64>,
    }

    pub struct stat {
        pub st_dev: crate::dev_t,
        #[cfg(not(gnu_file_offset_bits64))]
        __pad1: Padding<c_ushort>,
        pub st_ino: crate::ino_t,
        pub st_mode: crate::mode_t,
        pub st_nlink: crate::nlink_t,
        pub st_uid: crate::uid_t,
        pub st_gid: crate::gid_t,
        pub st_rdev: crate::dev_t,
        #[cfg(not(gnu_time_bits64))]
        __pad2: Padding<c_ushort>,
        pub st_size: off_t,
        pub st_blksize: crate::blksize_t,
        pub st_blocks: crate::blkcnt_t,
        pub st_atime: crate::time_t,
        #[cfg(gnu_time_bits64)]
        _atime_pad: Padding<c_int>,
        pub st_atime_nsec: c_long,
        pub st_mtime: crate::time_t,
        #[cfg(gnu_time_bits64)]
        _mtime_pad: Padding<c_int>,
        pub st_mtime_nsec: c_long,
        pub st_ctime: crate::time_t,
        #[cfg(gnu_time_bits64)]
        _ctime_pad: Padding<c_int>,
        pub st_ctime_nsec: c_long,
        #[cfg(not(gnu_time_bits64))]
        __glibc_reserved4: Padding<c_ulong>,
        #[cfg(not(gnu_time_bits64))]
        __glibc_reserved5: Padding<c_ulong>,
    }

    pub struct stat64 {
        pub st_dev: crate::dev_t,
        pub st_ino: crate::ino64_t,
        pub st_mode: crate::mode_t,
        pub st_nlink: crate::nlink_t,
        pub st_uid: crate::uid_t,
        pub st_gid: crate::gid_t,
        pub st_rdev: crate::dev_t,
        #[cfg(not(gnu_time_bits64))]
        __pad2: Padding<c_ushort>,
        pub st_size: off64_t,
        pub st_blksize: crate::blksize_t,
        pub st_blocks: crate::blkcnt64_t,
        pub st_atime: crate::time_t,
        #[cfg(gnu_time_bits64)]
        _atime_pad: Padding<c_int>,
        pub st_atime_nsec: c_long,
        pub st_mtime: crate::time_t,
        #[cfg(gnu_time_bits64)]
        _mtime_pad: Padding<c_int>,
        pub st_mtime_nsec: c_long,
        pub st_ctime: crate::time_t,
        #[cfg(gnu_time_bits64)]
        _ctime_pad: Padding<c_int>,
        pub st_ctime_nsec: c_long,
        #[cfg(not(gnu_time_bits64))]
        __glibc_reserved4: Padding<c_ulong>,
        #[cfg(not(gnu_time_bits64))]
        __glibc_reserved5: Padding<c_ulong>,
    }

    pub struct statfs64 {
        pub f_type: crate::__fsword_t,
        pub f_bsize: crate::__fsword_t,
        pub f_blocks: u64,
        pub f_bfree: u64,
        pub f_bavail: u64,
        pub f_files: u64,
        pub f_ffree: u64,
        pub f_fsid: crate::fsid_t,
        pub f_namelen: crate::__fsword_t,
        pub f_frsize: crate::__fsword_t,
        pub f_flags: crate::__fsword_t,
        pub f_spare: [crate::__fsword_t; 4],
    }

    pub struct statvfs64 {
        pub f_bsize: c_ulong,
        pub f_frsize: c_ulong,
        pub f_blocks: u64,
        pub f_bfree: u64,
        pub f_bavail: u64,
        pub f_files: u64,
        pub f_ffree: u64,
        pub f_favail: u64,
        pub f_fsid: c_ulong,
        __f_unused: Padding<c_int>,
        pub f_flag: c_ulong,
        pub f_namemax: c_ulong,
        __f_spare: [c_int; 6],
    }

    pub struct shmid_ds {
        pub shm_perm: crate::ipc_perm,
        #[cfg(gnu_time_bits64)]
        pub shm_segsz: size_t,
        #[cfg(not(gnu_time_bits64))]
        __glibc_reserved1: Padding<c_uint>,
        pub shm_atime: crate::time_t,
        #[cfg(not(gnu_time_bits64))]
        __glibc_reserved2: Padding<c_uint>,
        pub shm
```

---

# OUTRO - powerpc.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\linux_like\linux\musl\b32\powerpc.rs
**SHA:** a946612120ed9700
**Timestamp:** 2026-08-28T02:34:44.198531
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const VSTART: usize = 13;
- pub const ERESTART: c_int = 85;
- pub const SYS_timer_getoverrun: c_long = 243;
- pub const SYS_spu_run: c_long = 278;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::off_t;
use crate::prelude::*;

pub type wchar_t = i32;

pub type stat64 = stat;

s! {
    pub struct termios {
        pub c_iflag: crate::tcflag_t,
        pub c_oflag: crate::tcflag_t,
        pub c_cflag: crate::tcflag_t,
        pub c_lflag: crate::tcflag_t,
        pub c_cc: [crate::cc_t; crate::NCCS],
        pub c_line: crate::cc_t,
        pub __c_ispeed: crate::speed_t,
        pub __c_ospeed: crate::speed_t,
    }

    pub struct stat {
        pub st_dev: crate::dev_t,
        pub st_ino: crate::ino_t,
        pub st_mode: crate::mode_t,
        pub st_nlink: crate::nlink_t,
        pub st_uid: crate::uid_t,
        pub st_gid: crate::gid_t,
        pub st_rdev: crate::dev_t,
        __st_rdev_padding: Padding<c_short>,
        pub st_size: off_t,
        pub st_blksize: crate::blksize_t,
        pub st_blocks: crate::blkcnt_t,

        #[cfg(musl32_time64)]
        __st_atim32: Padding<__c_anonymous_timespec32>,
        #[cfg(musl32_time64)]
        __st_mtim32: Padding<__c_anonymous_timespec32>,
        #[cfg(musl32_time64)]
        __st_ctim32: Padding<__c_anonymous_timespec32>,

        #[cfg(musl_v1_2_3)]
        __unused: Padding<[c_long; 2]>,

        pub st_atime: crate::time_t,
        #[cfg(all(musl32_time64, target_endian = "big"))]
        __pad0: Padding<u32>,
        pub st_atime_nsec: c_long,
        #[cfg(all(musl32_time64, target_endian = "little"))]
        __pad0: Padding<u32>,
        pub st_mtime: crate::time_t,
        #[cfg(all(musl32_time64, target_endian = "big"))]
        __pad1: Padding<u32>,
        pub st_mtime_nsec: c_long,
        #[cfg(all(musl32_time64, target_endian = "little"))]
        __pad1: Padding<u32>,
        pub st_ctime: crate::time_t,
        #[cfg(all(musl32_time64, target_endian = "big"))]
        __pad2: Padding<u32>,
        pub st_ctime_nsec: c_long,
        #[cfg(all(musl32_time64, target_endian = "little"))]
        __pad2: Padding<u32>,

        #[cfg(not(musl_v1_2_3))]
        __unused: Padding<[c_long; 2]>,
    }

    struct __c_anonymous_timespec32 {
        __tv_sec: c_long,
        __tv_nsec: c_long,
    }

    pub struct stack_t {
        pub ss_sp: *mut c_void,
        pub ss_flags: c_int,
        pub ss_size: size_t,
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
        __pad2: Padding<c_longlong>,
        __pad3: Padding<c_longlong>,
    }

    pub struct shmid_ds {
        pub shm_perm: crate::ipc_perm,

        #[cfg(musl32_time64)]
        __shm_atime_hi: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __shm_atime_lo: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __shm_dtime_hi: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __shm_dtime_lo: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __shm_ctime_hi: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __shm_ctime_lo: Padding<c_ulong>,

        #[cfg(not(musl32_time64))]
        __unused1: Padding<c_int>,
        #[cfg(not(musl32_time64))]
        pub shm_atime: crate::time_t,
        #[cfg(not(musl32_time64))]
        __unused2: Padding<c_int>,
        #[cfg(not(musl32_time64))]
        pub shm_dtime: crate::time_t,
        #[cfg(not(musl32_time64))]
        __unused3: Padding<c_int>,
        #[cfg(not(musl32_time64))]
        pub shm_ctime: crate::time_t,
        #[cfg(not(musl32_time64))]
        __unused4: Padding<c_int>,

        #[cfg(musl32_time64)]
        __pad1: Padding<c_ulong>,

        pub shm_segsz: size_t,
        pub shm_cpid: crate::pid_t,
        pub shm_lpid: crate::pid_t,
        pub shm_nattch: c_ulong,
        #[cfg(not(musl32_time64))]
        __pad1: Padding<c_ulong>,
        __pad2: Padding<c_ulong>,

        #[cfg(musl32_time64)]
        pub shm_atime: crate::time_t,
        #[cfg(musl32_time64)]
        pub shm_dtime: crate::time_t,
        #[cfg(musl32_time64)]
        pub shm_ctime: crate::time_t,
    }

    pub struct msqid_ds {
        pub msg_perm: crate::ipc_perm,

        #[cfg(musl32_time64)]
        __msg_stime_hi: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __msg_stime_lo: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __msg_rtime_hi: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __msg_rtime_lo: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __msg_ctime_hi: Padding<c_ulong>,
        #[cfg(musl32_time64)]
        __msg_ctime_lo: Padding<c_ulong>,

        #[cfg(not(musl32_time64))]
        __unused1: Padding<c_int>,
        #[cfg(not(musl32_tim
```