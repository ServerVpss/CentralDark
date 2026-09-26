# COMANDO - linux_l4re_shared.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\linux_like\linux_l4re_shared.rs
**SHA:** ee47eb40a299f489
**Timestamp:** 2026-08-28T02:34:42.552833
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub mem_start: c_ulong,
- pub const _SC_2_FORT_RUN: c_int = 50;
- pub const PR_SET_MM_ARG_START: c_int = 8;
- pub const PR_SET_MM_ENV_START: c_int = 10;

### Padroes
- pattern: *const c_char,
- pub fn regcomp(preg: *mut crate::regex_t, pattern: *const c_char, cflags: c_int) -> c_int;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::prelude::*;

pub type Elf32_Half = u16;
pub type Elf32_Word = u32;
pub type Elf32_Off = u32;
pub type Elf32_Addr = u32;
pub type Elf32_Xword = u64;
pub type Elf32_Sword = i32;

pub type Elf64_Half = u16;
pub type Elf64_Word = u32;
pub type Elf64_Off = u64;
pub type Elf64_Addr = u64;
pub type Elf64_Xword = u64;
pub type Elf64_Sxword = i64;
pub type Elf64_Sword = i32;

pub type Elf32_Section = u16;
pub type Elf64_Section = u16;

pub type Elf32_Relr = Elf32_Word;
pub type Elf64_Relr = Elf32_Xword;
pub type Elf32_Rel = __c_anonymous_elf32_rel;
pub type Elf64_Rel = __c_anonymous_elf64_rel;

cfg_if! {
    if #[cfg(not(target_arch = "sparc64"))] {
        pub type Elf32_Rela = __c_anonymous_elf32_rela;
        pub type Elf64_Rela = __c_anonymous_elf64_rela;
    }
}

pub type iconv_t = *mut c_void;

s! {
    pub struct glob_t {
        pub gl_pathc: size_t,
        pub gl_pathv: *mut *mut c_char,
        pub gl_offs: size_t,
        pub gl_flags: c_int,

        __unused1: Padding<*mut c_void>,
        __unused2: Padding<*mut c_void>,
        __unused3: Padding<*mut c_void>,
        __unused4: Padding<*mut c_void>,
        __unused5: Padding<*mut c_void>,
    }

    pub struct passwd {
        pub pw_name: *mut c_char,
        pub pw_passwd: *mut c_char,
        pub pw_uid: crate::uid_t,
        pub pw_gid: crate::gid_t,
        pub pw_gecos: *mut c_char,
        pub pw_dir: *mut c_char,
        pub pw_shell: *mut c_char,
    }

    pub struct spwd {
        pub sp_namp: *mut c_char,
        pub sp_pwdp: *mut c_char,
        pub sp_lstchg: c_long,
        pub sp_min: c_long,
        pub sp_max: c_long,
        pub sp_warn: c_long,
        pub sp_inact: c_long,
        pub sp_expire: c_long,
        pub sp_flag: c_ulong,
    }

    pub struct itimerspec {
        pub it_interval: crate::timespec,
        pub it_value: crate::timespec,
    }

    pub struct fsid_t {
        __val: [c_int; 2],
    }

    pub struct cpu_set_t {
        #[cfg(all(target_pointer_width = "32", not(target_arch = "x86_64")))]
        bits: [u32; 32],
        #[cfg(not(all(target_pointer_width = "32", not(target_arch = "x86_64"))))]
        bits: [u64; 16],
    }

    pub struct sembuf {
        pub sem_num: c_ushort,
        pub sem_op: c_short,
        pub sem_flg: c_short,
    }

    pub struct dl_phdr_info {
        #[cfg(target_pointer_width = "64")]
        pub dlpi_addr: Elf64_Addr,
        #[cfg(target_pointer_width = "32")]
        pub dlpi_addr: Elf32_Addr,

        pub dlpi_name: *const c_char,

        #[cfg(target_pointer_width = "64")]
        pub dlpi_phdr: *const Elf64_Phdr,
        #[cfg(target_pointer_width = "32")]
        pub dlpi_phdr: *const Elf32_Phdr,

        #[cfg(target_pointer_width = "64")]
        pub dlpi_phnum: Elf64_Half,
        #[cfg(target_pointer_width = "32")]
        pub dlpi_phnum: Elf32_Half,

        // As of uClibc 1.0.36, the following fields are
        // gated behind a "#if 0" block which always evaluates
        // to false. So I'm just removing these, and if uClibc changes
        // the #if block in the future to include the following fields, these
        // will probably need including here. tsidea, skrap
        // QNX (NTO) platform does not define these fields
        #[cfg(not(any(target_env = "uclibc", target_os = "nto")))]
        pub dlpi_adds: c_ulonglong,
        #[cfg(not(any(target_env = "uclibc", target_os = "nto")))]
        pub dlpi_subs: c_ulonglong,
        #[cfg(not(any(target_env = "uclibc", target_os = "nto")))]
        pub dlpi_tls_modid: size_t,
        #[cfg(not(any(target_env = "uclibc", target_os = "nto")))]
        pub dlpi_tls_data: *mut c_void,
    }

    pub struct Elf32_Ehdr {
        pub e_ident: [c_uchar; 16],
        pub e_type: Elf32_Half,
        pub e_machine: Elf32_Half,
        pub e_version: Elf32_Word,
        pub e_entry: Elf32_Addr,
        pub e_phoff: Elf32_Off,
        pub e_shoff: Elf32_Off,
        pub e_flags: Elf32_Word,
        pub e_ehsize: Elf32_Half,
        pub e_phentsize: Elf32_Half,
        pub e_phnum: Elf32_Half,
        pub e_shentsize: Elf32_Half,
        pub e_shnum: Elf32_Half,
        pub e_shstrndx: Elf32_Half,
    }

    pub struct Elf64_Ehdr {
        pub e_ident: [c_uchar; 16],
        pub e_type: Elf64_Half,
        pub e_machine: Elf64_Half,
        pub e_version: Elf64_Word,
        pub e_entry: Elf64_Addr,
        pub e_phoff: Elf64_Off,
        pub e_shoff: Elf64_Off,
        pub e_flags: Elf64_Word,
        pub e_ehsize: Elf64_Half,
        pub e_phentsize: Elf64_Half,
        pub e_phnum: Elf64_Half,
        pub e_shentsize: Elf64_Half,
        pub e_shnum: Elf64_Half,
        pub e_shstrndx: Elf64_Half,
    }

    pub struct Elf32_Sym {
        pub st_name: Elf32_Word,
        pub st_value: Elf32_Addr,
        pub st_size: Elf32_Word,
        pub st_info: c_uchar,
        pub st_other: c_uchar,
        pub st_shndx: Elf32_Section,
    }

    pub struct Elf64_Sym {
        pub st_name: Elf64_Word,
        p
```