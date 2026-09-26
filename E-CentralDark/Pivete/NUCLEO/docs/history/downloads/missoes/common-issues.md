# Android Common Issues

## Token invalid / join fails

- Verify token issued by backend with correct Video SDK key/secret.
- Confirm session name, role claims, and expiration window.

## Local video/audio not starting

- Check runtime permissions and OS-level privacy controls.
- Ensure start media calls happen after join success.

## Remote tiles not updating

- Validate event listener registration order.
- Drive tile updates from participant/media events, not static snapshots.

## Build problems after SDK upgrade

- Recheck dependency conflicts and packaging options.
- Revisit keep rules and ABI packaging configuration.
## 4. Version drift breakage

- Rebuild against pinned SDK version.
- Revisit renamed interfaces in API reference map.
- Re-test breakout, raw data, and advanced feature modules after upgrade.
