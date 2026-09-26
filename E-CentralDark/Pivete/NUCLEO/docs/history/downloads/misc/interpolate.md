# OUTRO - interpolate.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\util\interpolate.rs
**SHA:** 1d716d26ed80beb0
**Timestamp:** 2026-08-28T02:35:06.583253
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = i;

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Provides routines for interpolating capture group references.

That is, if a replacement string contains references like `$foo` or `${foo1}`,
then they are replaced with the corresponding capture values for the groups
named `foo` and `foo1`, respectively. Similarly, syntax like `$1` and `${1}`
is supported as well, with `1` corresponding to a capture group index and not
a name.

This module provides the free functions [`string`] and [`bytes`], which
interpolate Rust Unicode strings and byte strings, respectively.

# Format

These routines support two different kinds of capture references: unbraced and
braced.

For the unbraced format, the format supported is `$ref` where `name` can be
any character in the class `[0-9A-Za-z_]`. `ref` is always the longest
possible parse. So for example, `$1a` corresponds to the capture group named
`1a` and not the capture group at index `1`. If `ref` matches `^[0-9]+$`, then
it is treated as a capture group index itself and not a name.

For the braced format, the format supported is `${ref}` where `ref` can be any
sequence of bytes except for `}`. If no closing brace occurs, then it is not
considered a capture reference. As with the unbraced format, if `ref` matches
`^[0-9]+$`, then it is treated as a capture group index and not a name.

The braced format is useful for exerting precise control over the name of the
capture reference. For example, `${1}a` corresponds to the capture group
reference `1` followed by the letter `a`, where as `$1a` (as mentioned above)
corresponds to the capture group reference `1a`. The braced format is also
useful for expressing capture group names that use characters not supported by
the unbraced format. For example, `${foo[bar].baz}` refers to the capture group
named `foo[bar].baz`.

If a capture group reference is found and it does not refer to a valid capture
group, then it will be replaced with the empty string.

To write a literal `$`, use `$$`.

To be clear, and as exhibited via the type signatures in the routines in this
module, it is impossible for a replacement string to be invalid. A replacement
string may not have the intended semantics, but the interpolation procedure
itself can never fail.
*/

use alloc::{string::String, vec::Vec};

use crate::util::memchr::memchr;

/// Accepts a replacement string and interpolates capture references with their
/// corresponding values.
///
/// `append` should be a function that appends the string value of a capture
/// group at a particular index to the string given. If the capture group
/// index is invalid, then nothing should be appended.
///
/// `name_to_index` should be a function that maps a capture group name to a
/// capture group index. If the given name doesn't exist, then `None` should
/// be returned.
///
/// Finally, `dst` is where the final interpolated contents should be written.
/// If `replacement` contains no capture group references, then `dst` will be
/// equivalent to `replacement`.
///
/// See the [module documentation](self) for details about the format
/// supported.
///
/// # Example
///
/// ```
/// use regex_automata::util::interpolate;
///
/// let mut dst = String::new();
/// interpolate::string(
///     "foo $bar baz",
///     |index, dst| {
///         if index == 0 {
///             dst.push_str("BAR");
///         }
///     },
///     |name| {
///         if name == "bar" {
///             Some(0)
///         } else {
///             None
///         }
///     },
///     &mut dst,
/// );
/// assert_eq!("foo BAR baz", dst);
/// ```
pub fn string(
    mut replacement: &str,
    mut append: impl FnMut(usize, &mut String),
    mut name_to_index: impl FnMut(&str) -> Option<usize>,
    dst: &mut String,
) {
    while !replacement.is_empty() {
        match memchr(b'$', replacement.as_bytes()) {
            None => break,
            Some(i) => {
                dst.push_str(&replacement[..i]);
                replacement = &replacement[i..];
            }
        }
        // Handle escaping of '$'.
        if replacement.as_bytes().get(1).map_or(false, |&b| b == b'$') {
            dst.push_str("$");
            replacement = &replacement[2..];
            continue;
        }
        debug_assert!(!replacement.is_empty());
        let cap_ref = match find_cap_ref(replacement.as_bytes()) {
            Some(cap_ref) => cap_ref,
            None => {
                dst.push_str("$");
                replacement = &replacement[1..];
                continue;
            }
        };
        replacement = &replacement[cap_ref.end..];
        match cap_ref.cap {
            Ref::Number(i) => append(i, dst),
            Ref::Named(name) => {
                if let Some(i) = name_to_index(name) {
                    append(i, dst);
                }
            }
        }
    }
    dst.push_str(replacement);
}

/// Accepts a replacement byte string and interpolates capture references with
/// their corresponding values.
///
/// `append` should be a function that appends the 
```