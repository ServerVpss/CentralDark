# OUTRO - hexagon.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\linux_like\linux\musl\b32\hexagon.rs
**SHA:** e0e53f5575871faa
**Timestamp:** 2026-08-28T02:34:44.167331
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const ERESTART: c_int = 85;
- pub const SYS_timer_getoverrun: c_int = 109;
- pub const VSTART: usize = 8;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::prelude::*;

pub type wchar_t = u32;
pub type stat64 = crate::stat;

s! {
    pub struct stat {
        pub st_dev: crate::dev_t,
        pub st_ino: c_ulonglong,
        pub st_mode: c_uint,
        pub st_nlink: c_uint,
        pub st_uid: c_uint,
        pub st_gid: c_uint,
        pub st_rdev: c_ulonglong,
        __st_rdev_padding: Padding<c_ulong>,
        pub st_size: c_longlong,
        pub st_blksize: crate::blksize_t,
        __st_blksize_padding: Padding<c_int>,
        pub st_blocks: crate::blkcnt_t,

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

        __unused: Padding<[c_int; 2]>,
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
                to __key in a future release"
        )]
        pub __ipc_perm_key: crate::key_t,
        pub uid: crate::uid_t,
        pub gid: crate::gid_t,
        pub cuid: crate::uid_t,
        pub cgid: crate::gid_t,
        pub mode: crate::mode_t,
        pub __seq: c_int,
        __pad1: Padding<c_long>,
        __pad2: Padding<c_long>,
    }

    pub struct shmid_ds {
        pub shm_perm: crate::ipc_perm,
        pub shm_segsz: size_t,
        pub shm_atime: crate::time_t,
        __unused1: Padding<c_int>,
        pub shm_dtime: crate::time_t,
        __unused2: Padding<c_int>,
        pub shm_ctime: crate::time_t,
        __unused3: Padding<c_int>,
        pub shm_cpid: crate::pid_t,
        pub shm_lpid: crate::pid_t,
        pub shm_nattch: c_ulong,
        __pad1: Padding<c_ulong>,
        __pad2: Padding<c_ulong>,
    }

    pub struct msqid_ds {
        pub msg_perm: crate::ipc_perm,
        pub msg_stime: crate::time_t,
        __unused1: Padding<c_int>,
        pub msg_rtime: crate::time_t,
        __unused2: Padding<c_int>,
        pub msg_ctime: crate::time_t,
        __unused3: Padding<c_int>,
        pub __msg_cbytes: c_ulong,
        pub msg_qnum: crate::msgqnum_t,
        pub msg_qbytes: crate::msglen_t,
        pub msg_lspid: crate::pid_t,
        pub msg_lrpid: crate::pid_t,
        __pad1: Padding<c_ulong>,
        __pad2: Padding<c_ulong>,
    }
}

pub const AF_FILE: c_int = 1;
pub const AF_KCM: c_int = 41;

/// Constants may change across releases. See the [usage guidelines](crate#usage-guidelines)
/// for details.
pub const AF_MAX: c_int = 43;

pub const AF_QIPCRTR: c_int = 42;
pub const EADDRINUSE: c_int = 98;
pub const EADDRNOTAVAIL: c_int = 99;
pub const EAFNOSUPPORT: c_int = 97;
pub const EALREADY: c_int = 114;
pub const EBADE: c_int = 52;
pub const EBADFD: c_int = 77;
pub const EBADMSG: c_int = 74;
pub const EBADR: c_int = 53;
pub const EBADRQC: c_int = 56;
pub const EBADSLT: c_int = 57;
pub const ECANCELED: c_int = 125;
pub const ECHRNG: c_int = 44;
pub const ECONNABORTED: c_int = 103;
pub const ECONNREFUSED: c_int = 111;
pub const ECONNRESET: c_int = 104;
pub const EDEADLK: c_int = 35;
pub const EDEADLOCK: c_int = 35;
pub const EDESTADDRREQ: c_int = 89;
pub const EDQUOT: c_int = 122;
pub const EHOSTDOWN: c_int = 112;
pub const EHOSTUNREACH: c_int = 113;
pub const EHWPOISON: c_int = 133;
pub const EIDRM: c_int = 43;
pub const EILSEQ: c_int = 84;
pub const EINPROGRESS: c_int = 115;
pub const EISCONN: c_int = 106;
pub const EISNAM: c_int = 120;
pub const EKEYEXPIRED: c_int = 127;
pub const EKEYREJECTED: c_int = 129;
pub const EKEYREVOKED: c_int = 128;
pub const EL2HLT: c_int = 51;
pub const EL2NSYNC: c_int = 45;
pub const EL3HLT: c_int = 46;
pub const EL3RST: c_int = 47;
pub const ELIBACC: c_int = 79;
pub const ELIBBAD: c_int = 80;
pub const ELIBEXEC: c_int = 83;
pub const ELIBMAX: c_int = 82;
pub const ELIBSCN: c_int = 81;
pub const ELNRNG: c_int = 48;
pub const ELOOP: c_int = 40;
pub const EMEDIUMTYPE: c_int = 124;
pub const EMSGSIZE: c_int = 90;
pub const EMULTIHOP: c_int = 72;
pub const ENAMETOOLONG: c_int = 36;
pub const ENAVAIL: c_int = 119;
pub const ENETDOWN: c_int = 100;
pub const ENETRESET: c_int = 102;
pub const ENETUNREACH: c_int = 101;
pub const ENOANO: c_int = 55;
pub const ENOBUFS: c_int = 1
```