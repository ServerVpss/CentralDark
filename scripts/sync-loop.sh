
#!/bin/bash

while true; do

  rclone sync /root/CentralDark/docs gdrive:CentralDark/docs --transfers=1 --bwlimit=2M

  sleep 120

done

