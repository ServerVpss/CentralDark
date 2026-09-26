# REFERENCIA - parser.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cc-1.4.2\src\target\parser.rs
**SHA:** 6345ea5cc7c1dd2d
**Timestamp:** 2026-08-28T02:33:21.890069
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Remove once MSRV is bumped to 1.91 and `rustc` removes these from `target_abi`.

### Ouro Bruto (primeiros 5000 chars)
```
use std::mem;

use crate::{
    target::TargetInfo,
    utilities::{cargo_env_var, OnceLock},
    Error, ErrorKind,
};

#[derive(Debug)]
struct TargetInfoParserInner {
    full_arch: Box<str>,
    arch: Box<str>,
    vendor: Box<str>,
    os: Box<str>,
    env: Box<str>,
    abi: Box<str>,
}

impl TargetInfoParserInner {
    fn from_cargo_environment_variables() -> Result<Self, Error> {
        // `TARGET` must be present.
        let target_name = cargo_env_var("TARGET")?;

        // Parse the full architecture name from the target name.
        let (full_arch, _rest) = target_name.split_once('-').ok_or(Error::new(
            ErrorKind::InvalidTarget,
            format!("target `{target_name}` only had a single component (at least two required)"),
        ))?;

        let cargo_env = |key, fallback: Option<&str>| match cargo_env_var(key) {
            Ok(var) => Ok(var.into_boxed_str()),
            Err(err) => match fallback {
                Some(fallback) => Ok(fallback.into()),
                None => Err(Error::new(
                    ErrorKind::EnvVarNotFound,
                    format!(
                        "did not find fallback information for target `{target_name}`: {}",
                        err.message
                    ),
                )),
            },
        };

        // Prefer to use `CARGO_ENV_*` if set, since these contain the most
        // correct information relative to the current `rustc`, and makes it
        // possible to support custom target JSON specs unknown to `rustc`.
        //
        // NOTE: If the user is using an older `rustc`, that data may be older
        // than our pre-generated data, but we still prefer Cargo's view of
        // the world, since at least `cc` won't differ from `rustc` in that
        // case.
        //
        // These may not be set in case the user depended on being able to
        // just set `TARGET` outside of build scripts; in those cases, fall
        // back back to data from the known set of target names instead.
        //
        // See discussion in #1225 for further details.
        let fallback_target = TargetInfo::from_rustc_target(&target_name).ok();
        let ft = fallback_target.as_ref();
        let arch = cargo_env("CARGO_CFG_TARGET_ARCH", ft.map(|t| t.arch))?;
        let vendor = cargo_env("CARGO_CFG_TARGET_VENDOR", ft.map(|t| t.vendor))?;
        let os = cargo_env("CARGO_CFG_TARGET_OS", ft.map(|t| t.os))?;
        let mut env = cargo_env("CARGO_CFG_TARGET_ENV", ft.map(|t| t.env))?;
        // `target_abi` was stabilized in Rust 1.78, which is higher than our
        // MSRV, so it may not always be available; In that case, fall back to
        // `""`, which is _probably_ correct for unknown target names.
        let mut abi = cargo_env("CARGO_CFG_TARGET_ABI", ft.map(|t| t.abi))
            .unwrap_or_else(|_| String::default().into_boxed_str());

        // Remove `macabi` and `sim` from `target_abi` (if present), it's been moved to `target_env`.
        // TODO: Remove once MSRV is bumped to 1.91 and `rustc` removes these from `target_abi`.
        if matches!(&*abi, "macabi" | "sim") {
            debug_assert!(
                matches!(&*env, "" | "macabi" | "sim"),
                "env/abi mismatch: {:?}, {:?}",
                env,
                abi,
            );
            env = mem::replace(&mut abi, String::default().into_boxed_str());
        }

        Ok(Self {
            full_arch: full_arch.to_string().into_boxed_str(),
            arch,
            vendor,
            os,
            env,
            abi,
        })
    }
}

/// Parser for [`TargetInfo`], contains cached information.
#[derive(Default, Debug)]
pub(crate) struct TargetInfoParser(OnceLock<Result<TargetInfoParserInner, Error>>);

impl TargetInfoParser {
    pub fn parse_from_cargo_environment_variables(&self) -> Result<TargetInfo<'_>, Error> {
        match self
            .0
            .get_or_init(TargetInfoParserInner::from_cargo_environment_variables)
        {
            Ok(TargetInfoParserInner {
                full_arch,
                arch,
                vendor,
                os,
                env,
                abi,
            }) => Ok(TargetInfo {
                full_arch,
                arch,
                vendor,
                os,
                env,
                abi,
            }),
            Err(e) => Err(e.clone()),
        }
    }
}

/// Parse the full architecture in the target name into the simpler
/// `cfg(target_arch = "...")` that `rustc` exposes.
fn parse_arch(full_arch: &str) -> Option<&str> {
    // NOTE: Some of these don't necessarily match an existing target in
    // `rustc`. They're parsed anyhow to be as forward-compatible as possible,
    // while still being correct.
    //
    // See also:
    // https://docs.rs/cfg-expr/0.18.0/cfg_expr/targets/index.html
    // https://docs.rs/target-lexicon/0.13.2/target_lexicon/enum.Architecture.html
    // https://gcc.gnu
```