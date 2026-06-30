#!/bin/bash
# Backup de leitura da Consciência no Drive (Git→Drive, nunca o contrário).
# copy (não sync): nunca apaga nada no Drive, só adiciona/atualiza.
rclone copy /root/CentralDark/docs/CONSCIENCIA/ gdrive:CentralDark-Memoria/
