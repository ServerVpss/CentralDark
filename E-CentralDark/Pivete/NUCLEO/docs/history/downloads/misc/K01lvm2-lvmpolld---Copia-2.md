# OUTRO - K01lvm2-lvmpolld - Copia (2)
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\K01lvm2-lvmpolld - Copia (2)
**SHA:** edadd4bada1dc28e
**Timestamp:** 2026-08-26T19:20:48.975260
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- # Required-Start:    $local_fs
- # Default-Start:     2 3 4 5

### Ouro Bruto (primeiros 5000 chars)
```
#!/bin/sh
# kFreeBSD do not accept scripts as interpreters, using #!/bin/sh and sourcing.
if [ true != "$INIT_D_SCRIPT_SOURCED" ] ; then
    set "$0" "$@"; INIT_D_SCRIPT_SOURCED=true . /lib/init/init-d-script
fi
### BEGIN INIT INFO
# Provides:          lvm2-lvmpolld
# Required-Start:    $local_fs
# Required-Stop:     $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: LVM2 poll daemon
### END INIT INFO

DESC="LVM2 poll daemon"
DAEMON=/sbin/lvmpolld
DAEMON_ARGS="-t 60"
PIDFILE=/run/lvmpolld.pid

do_start_prepare() {
  mkdir -m 0700 -p /run/lvm
}

```