# REFERENCIA - neutrino.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\nto\neutrino.rs
**SHA:** 59e3b22aa27c2aba
**Timestamp:** 2026-08-28T02:34:45.340847
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const _PULSE_CODE_RESTART: i32 = -39;
- pub const _PULSE_CODE_NORESTART: i32 = -40;
- pub const _PULSE_CODE_UNBLOCK_RESTART: i32 = -41;

### Gaps
- // TODO: The following structures are defined in a header file which doesn't
- // TODO: The following function uses a structure defined in a header file
- //TODO: The following commented out functions are implemented in assembly.

### Ouro Bruto (primeiros 5000 chars)
```
//! APIs that are specific to QNX Neutrino and not found in other operating systems

use crate::prelude::*;

pub type nto_job_t = crate::sync_t;

s! {
    pub struct syspage_entry_info {
        pub entry_off: u16,
        pub entry_size: u16,
    }
    pub struct syspage_array_info {
        entry_off: u16,
        entry_size: u16,
        element_size: u16,
    }

    pub struct intrspin {
        pub value: c_uint, // volatile
    }

    pub struct iov_t {
        pub iov_base: *mut c_void, // union
        pub iov_len: size_t,
    }

    pub struct _itimer {
        pub nsec: u64,
        pub interval_nsec: u64,
    }

    pub struct _msg_info64 {
        pub nd: u32,
        pub srcnd: u32,
        pub pid: crate::pid_t,
        pub tid: i32,
        pub chid: i32,
        pub scoid: i32,
        pub coid: i32,
        pub priority: i16,
        pub flags: i16,
        pub msglen: isize,
        pub srcmsglen: isize,
        pub dstmsglen: isize,
        pub type_id: u32,
        reserved: Padding<u32>,
    }

    pub struct _cred_info {
        pub ruid: crate::uid_t,
        pub euid: crate::uid_t,
        pub suid: crate::uid_t,
        pub rgid: crate::gid_t,
        pub egid: crate::gid_t,
        pub sgid: crate::gid_t,
        pub ngroups: u32,
        pub grouplist: [crate::gid_t; 8],
    }

    pub struct _client_info {
        pub nd: u32,
        pub pid: crate::pid_t,
        pub sid: crate::pid_t,
        pub flags: u32,
        pub cred: crate::_cred_info,
    }

    pub struct _client_able {
        pub ability: u32,
        pub flags: u32,
        pub range_lo: u64,
        pub range_hi: u64,
    }

    pub struct nto_channel_config {
        pub event: crate::sigevent,
        pub num_pulses: c_uint,
        pub rearm_threshold: c_uint,
        pub options: c_uint,
        reserved: Padding<[c_uint; 3]>,
    }

    // TODO: The following structures are defined in a header file which doesn't
    //       appear as part of the default headers found in a standard installation
    //       of Neutrino 7.1 SDP.  Commented out for now.
    //pub struct _asyncmsg_put_header {
    //    pub err: c_int,
    //    pub iov: *mut crate::iov_t,
    //    pub parts: c_int,
    //    pub handle: c_uint,
    //    pub cb: Option<
    //        unsafe extern "C" fn(
    //            err: c_int,
    //            buf: *mut c_void,
    //            handle: c_uint,
    //        ) -> c_int>,
    //    pub put_hdr_flags: c_uint,
    //}

    //pub struct _asyncmsg_connection_attr {
    //    pub call_back: Option<
    //        unsafe extern "C" fn(
    //            err: c_int,
    //            buff: *mut c_void,
    //            handle: c_uint,
    //        ) -> c_int>,
    //    pub buffer_size: size_t,
    //    pub max_num_buffer: c_uint,
    //    pub trigger_num_msg: c_uint,
    //    pub trigger_time: crate::_itimer,
    //    reserve: Padding<c_uint>,
    //}

    //pub struct _asyncmsg_connection_descriptor {
    //    pub flags: c_uint,
    //    pub sendq_size: c_uint,
    //    pub sendq_head: c_uint,
    //    pub sendq_tail: c_uint,
    //    pub sendq_free: c_uint,
    //    pub err: c_int,
    //    pub ev: crate::sigevent,
    //    pub num_curmsg: c_uint,
    //    pub ttimer: crate::timer_t,
    //    pub block_con: crate::pthread_cond_t,
    //    pub mu: crate::pthread_mutex_t,
    //    reserved: Padding<c_uint>,
    //    pub attr: crate::_asyncmsg_connection_attr,
    //    reserves: Padding<[c_uint; 3]>,
    //    pub sendq: [crate::_asyncmsg_put_header; 1], // flexarray
    //}

    pub struct __c_anonymous_struct_ev {
        pub event: crate::sigevent,
        pub coid: c_int,
    }

    pub struct _channel_connect_attr {
        // union
        pub ev: crate::__c_anonymous_struct_ev,
    }

    // FIXME(1.0): This should not implement `PartialEq`
    #[allow(unpredictable_function_pointer_comparisons)]
    pub struct _sighandler_info {
        pub siginfo: crate::siginfo_t,
        pub handler: Option<unsafe extern "C" fn(value: c_int)>,
        pub context: *mut c_void,
    }

    pub struct __c_anonymous_struct_time {
        pub length: c_uint,
        pub scale: c_uint,
    }

    pub struct _idle_hook {
        pub hook_size: c_uint,
        pub cmd: c_uint,
        pub mode: c_uint,
        pub latency: c_uint,
        pub next_fire: u64,
        pub curr_time: u64,
        pub tod_adjust: u64,
        pub resp: c_uint,
        pub time: __c_anonymous_struct_time,
        pub trigger: crate::sigevent,
        pub intrs: *mut c_uint,
        pub block_stack_size: c_uint,
    }

    pub struct _clockadjust {
        pub tick_count: u32,
        pub tick_nsec_inc: i32,
    }

    pub struct qtime_entry {
        pub cycles_per_sec: u64,
        pub nsec_tod_adjust: u64, // volatile
        pub nsec: u64,            // volatile
        pub nsec_inc: u32,
        pub boot_time: u32,
        pub adjust: _clockadjust,
        pub timer_rate: u32,
        pub timer_scale: 
```