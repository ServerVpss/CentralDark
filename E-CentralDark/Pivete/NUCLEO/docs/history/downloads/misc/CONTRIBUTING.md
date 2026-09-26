## Building and testing

```
yarn
yarn test
```

To run tests in a *browser* (for instance to test compatibility with Firefox, with Safari, or with old browser versions), run `yarn karma start`, then open http://localhost:9876/ in the browser you want to test in. Results of the test run will appear in the terminal where `yarn karma start` is running.

If you notice any problems, please report them to the GitHub issue tracker at
[http://github.com/kpdecker/jsdiff/issues](http://github.com/kpdecker/jsdiff/issues).

## Releasing

Run a test in Firefox via the procedure above before releasing.

A full release may be completed by first updating the `"version"` property in package.json, then running the following:

```
yarn clean
yarn build
yarn npm publish
```

After releasing, remember to:
* commit the `package.json` change and push it to GitHub
* create a new version tag on GitHub
* update `diff.js` on the `gh-pages` branch to the latest built version from the `dist/` folder.


---

# OUTRO - CONTRIBUTING.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\bitflags-2.13.1\CONTRIBUTING.md
**SHA:** 6c9f96eacb20af87
**Timestamp:** 2026-08-28T02:32:56.434996
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `bitflags` uses the `trybuild` crate to integration test its macros. Since Rust error messages change frequently enough that `nightly` builds produce spurious failures, we only check the compiler outp

### Ouro Bruto (primeiros 5000 chars)
```
# Updating compile-fail test outputs

`bitflags` uses the `trybuild` crate to integration test its macros. Since Rust error messages change frequently enough that `nightly` builds produce spurious failures, we only check the compiler output in `beta` builds. If you run:

```
TRYBUILD=overwrite cargo +beta test --all
```

it will run the tests and update the `trybuild` output files.

```