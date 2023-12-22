#!/bin/sh

VERSION="latest"

# pass insert homer-proxy/UNIFI_PASSWORD

docker pull ghcr.io/tvecera/homer-proxy:$VERSION

sudo docker run -d --name homer-proxy --restart=always -p 8081:3000 \
  -e UNIFI_PASSWORD="$(pass homer-proxy/UNIFI_PASSWORD)" \
  -e FIBARO_PASSWORD="$(pass homer-proxy/FIBARO_PASSWORD)" \
  -e WUD_PASSWORD="$(pass homer-proxy/WUD_PASSWORD)" \
  -e TASMOTA_PC_PASSWORD="$(pass homer-proxy/TASMOTA_PC_PASSWORD)" \
  -e TASMOTA_LAN_PASSWORD="$(pass homer-proxy/TASMOTA_LAN_PASSWORD)" \
  -e TASMOTA_TV_PASSWORD="$(pass homer-proxy/TASMOTA_TV_PASSWORD)" \
  -e TASMOTA_TV2_PASSWORD="$(pass homer-proxy/TASMOTA_TV2_PASSWORD)" \
  -e OSMC_OBYVAK_PASSWORD="$(pass homer-proxy/OSMC_OBYVAK_PASSWORD)" \
  -e OSMC_LOZNICE_PASSWORD="$(pass homer-proxy/OSMC_LOZNICE_PASSWORD)" \
  -e PRUSALINK_API_KEY="$(pass homer-proxy/PRUSALINK_API_KEY)" \
  -e PIHOLE_API_KEY="$(pass homer-proxy/PIHOLE_API_KEY)" \
  -e PORTAINER_API_KEY="$(pass homer-proxy/PORTAINER_API_KEY)" \
  -v ./config:/usr/app/config -v ./logs:/usr/app/logs ghcr.io/tvecera/homer-proxy:$VERSION
