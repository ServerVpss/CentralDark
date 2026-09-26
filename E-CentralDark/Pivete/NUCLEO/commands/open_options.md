# COMANDO - open_options.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\fs\open_options.rs
**SHA:** 8b0a91d002c691bb
**Timestamp:** 2026-08-28T02:36:11.165969
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Add support for converting `StdOpenOptions` to `UringOpenOptions`

### Ouro Bruto (primeiros 5000 chars)
```
use crate::fs::{asyncify, File};

use std::io;
use std::path::Path;

cfg_io_uring! {
    mod uring_open_options;
    pub(crate) use uring_open_options::UringOpenOptions;
    use crate::runtime::driver::op::Op;
}

#[cfg(test)]
mod mock_open_options;
#[cfg(test)]
use mock_open_options::MockOpenOptions as StdOpenOptions;
#[cfg(not(test))]
use std::fs::OpenOptions as StdOpenOptions;

#[cfg(unix)]
use std::os::unix::fs::OpenOptionsExt;
#[cfg(windows)]
use std::os::windows::fs::OpenOptionsExt;

/// Options and flags which can be used to configure how a file is opened.
///
/// This builder exposes the ability to configure how a [`File`] is opened and
/// what operations are permitted on the open file. The [`File::open`] and
/// [`File::create`] methods are aliases for commonly used options using this
/// builder.
///
/// Generally speaking, when using `OpenOptions`, you'll first call [`new`],
/// then chain calls to methods to set each option, then call [`open`], passing
/// the path of the file you're trying to open. This will give you a
/// [`io::Result`] with a [`File`] inside that you can further operate
/// on.
///
/// This is a specialized version of [`std::fs::OpenOptions`] for usage from
/// the Tokio runtime.
///
/// `From<std::fs::OpenOptions>` is implemented for more advanced configuration
/// than the methods provided here.
///
/// [`new`]: OpenOptions::new
/// [`open`]: OpenOptions::open
/// [`File`]: File
/// [`File::open`]: File::open
/// [`File::create`]: File::create
///
/// # Examples
///
/// Opening a file to read:
///
/// ```no_run
/// use tokio::fs::OpenOptions;
/// use std::io;
///
/// #[tokio::main]
/// async fn main() -> io::Result<()> {
///     let file = OpenOptions::new()
///         .read(true)
///         .open("foo.txt")
///         .await?;
///
///     Ok(())
/// }
/// ```
///
/// Opening a file for both reading and writing, as well as creating it if it
/// doesn't exist:
///
/// ```no_run
/// use tokio::fs::OpenOptions;
/// use std::io;
///
/// #[tokio::main]
/// async fn main() -> io::Result<()> {
///     let file = OpenOptions::new()
///         .read(true)
///         .write(true)
///         .create(true)
///         .open("foo.txt")
///         .await?;
///
///     Ok(())
/// }
/// ```
#[derive(Clone, Debug)]
pub struct OpenOptions {
    inner: Kind,
}

#[derive(Debug, Clone)]
enum Kind {
    Std(StdOpenOptions),
    #[cfg(all(
        tokio_unstable,
        feature = "io-uring",
        feature = "rt",
        feature = "fs",
        target_os = "linux"
    ))]
    Uring(UringOpenOptions),
}

impl OpenOptions {
    /// Creates a blank new set of options ready for configuration.
    ///
    /// All options are initially set to `false`.
    ///
    /// This is an async version of [`std::fs::OpenOptions::new`][std]
    ///
    /// [std]: std::fs::OpenOptions::new
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use tokio::fs::OpenOptions;
    ///
    /// let mut options = OpenOptions::new();
    /// let future = options.read(true).open("foo.txt");
    /// ```
    pub fn new() -> OpenOptions {
        #[cfg(all(
            tokio_unstable,
            feature = "io-uring",
            feature = "rt",
            feature = "fs",
            target_os = "linux"
        ))]
        let inner = Kind::Uring(UringOpenOptions::new());
        #[cfg(not(all(
            tokio_unstable,
            feature = "io-uring",
            feature = "rt",
            feature = "fs",
            target_os = "linux"
        )))]
        let inner = Kind::Std(StdOpenOptions::new());

        OpenOptions { inner }
    }

    /// Sets the option for read access.
    ///
    /// This option, when true, will indicate that the file should be
    /// `read`-able if opened.
    ///
    /// This is an async version of [`std::fs::OpenOptions::read`][std]
    ///
    /// [std]: std::fs::OpenOptions::read
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use tokio::fs::OpenOptions;
    /// use std::io;
    ///
    /// #[tokio::main]
    /// async fn main() -> io::Result<()> {
    ///     let file = OpenOptions::new()
    ///         .read(true)
    ///         .open("foo.txt")
    ///         .await?;
    ///
    ///     Ok(())
    /// }
    /// ```
    pub fn read(&mut self, read: bool) -> &mut OpenOptions {
        match &mut self.inner {
            Kind::Std(opts) => {
                opts.read(read);
            }
            #[cfg(all(
                tokio_unstable,
                feature = "io-uring",
                feature = "rt",
                feature = "fs",
                target_os = "linux"
            ))]
            Kind::Uring(opts) => {
                opts.read(read);
            }
        }
        self
    }

    /// Sets the option for write access.
    ///
    /// This option, when true, will indicate that the file should be
    /// `write`-able if opened.
    ///
    /// This is an async version of [`std::fs::OpenOptions::write`][std]
    ///
    /// [std]: st
```