# Examples

## Port listening (netstat output)
```
TCP    127.0.0.1:9119         0.0.0.0:0              LISTENING       28304
```
No output or exit code 1 means nothing listening.

## curl success
```
$ curl -s http://127.0.0.1:9119/
<!DOCTYPE html>
<html>
...
```
Exit code 0.

## curl failure
```
$ curl -s http://127.0.0.1:20128/
curl: (7) Failed to connect to 127.0.0.1 port 20128 after 0 ms: Connection refused
```
or empty output with non-zero exit.