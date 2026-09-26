# OUTRO - powerpc64.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\aix\powerpc64.rs
**SHA:** 814b5f3ccef00968
**Timestamp:** 2026-08-28T02:34:41.209938
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub l_start: off_t,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::off_t;
use crate::prelude::*;

// Define lock_data_instrumented as an empty enum
extern_ty! {
    pub type lock_data_instrumented;
}

s! {
    pub struct sigset_t {
        pub ss_set: [c_ulong; 4],
    }

    pub struct fd_set {
        pub fds_bits: [c_long; 1024],
    }

    pub struct flock {
        pub l_type: c_short,
        pub l_whence: c_short,
        pub l_sysid: c_uint,
        pub l_pid: crate::pid_t,
        pub l_vfs: c_int,
        pub l_start: off_t,
        pub l_len: off_t,
    }

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
        pub f_basetype: [c_char; 16],
        pub f_flag: c_ulong,
        pub f_namemax: c_ulong,
        pub f_fstr: [c_char; 32],
        pub f_filler: [c_ulong; 16],
    }

    pub struct pthread_rwlock_t {
        __rw_word: [c_long; 10],
    }

    pub struct pthread_cond_t {
        __cv_word: [c_long; 6],
    }

    pub struct pthread_mutex_t {
        __mt_word: [c_long; 8],
    }

    pub struct pthread_once_t {
        __on_word: [c_long; 9],
    }

    pub struct stat {
        pub st_dev: crate::dev_t,
        pub st_ino: crate::ino_t,
        pub st_mode: crate::mode_t,
        pub st_nlink: crate::nlink_t,
        pub st_flag: c_ushort,
        pub st_uid: crate::uid_t,
        pub st_gid: crate::gid_t,
        pub st_rdev: crate::dev_t,
        pub st_ssize: c_int,
        pub st_atim: crate::st_timespec,
        pub st_mtim: crate::st_timespec,
        pub st_ctim: crate::st_timespec,
        pub st_blksize: crate::blksize_t,
        pub st_blocks: crate::blkcnt_t,
        pub st_vfstype: c_int,
        pub st_vfs: c_uint,
        pub st_type: c_uint,
        pub st_gen: c_uint,
        st_reserved: Padding<[c_uint; 9]>,
        pub st_padto_ll: c_uint,
        pub st_size: off_t,
    }

    pub struct statfs {
        pub f_version: c_int,
        pub f_type: c_int,
        pub f_bsize: c_ulong,
        pub f_blocks: crate::fsblkcnt_t,
        pub f_bfree: crate::fsblkcnt_t,
        pub f_bavail: crate::fsblkcnt_t,
        pub f_files: crate::fsblkcnt_t,
        pub f_ffree: crate::fsblkcnt_t,
        pub f_fsid: crate::fsid64_t,
        pub f_vfstype: c_int,
        pub f_fsize: c_ulong,
        pub f_vfsnumber: c_int,
        pub f_vfsoff: c_int,
        pub f_vfslen: c_int,
        pub f_vfsvers: c_int,
        pub f_fname: [c_char; 32],
        pub f_fpack: [c_char; 32],
        pub f_name_max: c_int,
    }

    pub struct aiocb {
        pub aio_lio_opcode: c_int,
        pub aio_fildes: c_int,
        pub aio_word1: c_int,
        pub aio_offset: off_t,
        pub aio_buf: *mut c_void,
        pub aio_return: ssize_t,
        pub aio_errno: c_int,
        pub aio_nbytes: size_t,
        pub aio_reqprio: c_int,
        pub aio_sigevent: crate::sigevent,
        pub aio_word2: c_int,
        pub aio_fp: c_int,
        pub aio_handle: *mut aiocb,
        aio_reserved: Padding<[c_uint; 2]>,
        pub aio_sigev_tid: c_long,
    }

    pub struct __vmxreg_t {
        __v: [c_uint; 4],
    }

    pub struct __vmx_context_t {
        pub __vr: [crate::__vmxreg_t; 32],
        pub __pad1: [c_uint; 3],
        pub __vscr: c_uint,
        pub __vrsave: c_uint,
        pub __pad2: [c_uint; 3],
    }

    pub struct __vsx_context_t {
        pub __vsr_dw1: [c_ulonglong; 32],
    }

    pub struct __tm_context_t {
        pub vmx: crate::__vmx_context_t,
        pub vsx: crate::__vsx_context_t,
        pub gpr: [c_ulonglong; 32],
        pub lr: c_ulonglong,
        pub ctr: c_ulonglong,
        pub cr: c_uint,
        pub xer: c_uint,
        pub amr: c_ulonglong,
        pub texasr: c_ulonglong,
        pub tfiar: c_ulonglong,
        pub tfhar: c_ulonglong,
        pub ppr: c_ulonglong,
        pub dscr: c_ulonglong,
        pub tar: c_ulonglong,
        pub fpscr: c_uint,
        pub fpscrx: c_uint,
        pub fpr: [fpreg_t; 32],
        pub tmcontext: c_char,
        pub tmstate: c_char,
        pub prevowner: c_char,
        pub pad: [c_char; 5],
    }

    pub struct __context64 {
        pub gpr: [c_ulonglong; 32],
        pub msr: c_ulonglong,
        pub iar: c_ulonglong,
        pub lr: c_ulonglong,
        pub ctr: c_ulonglong,
        pub cr: c_uint,
        pub xer: c_uint,
        pub fpscr: c_uint,
        pub fpscrx: c_uint,
        pub except: [c_ulonglong; 1],
        pub fpr: [fpreg_t; 32],
        pub fpeu: c_char,
        pub fpinfo: c_char,
        pub fpscr24_31: c_char,
        pub pad: [c_char; 1],
        pub excp_type: c_int,
    }

    pub struct mcontext_t {
        pub jmp_context: __context64,
    }

    pub struct __extctx_t {
        pub __flags: c_uint,
        pub __rsvd1: [c_uint; 3],
        pub _
```