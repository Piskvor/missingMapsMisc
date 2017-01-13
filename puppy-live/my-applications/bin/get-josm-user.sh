#!/bin/bash

OUT_FILE="$HOME/Web-Server/local.json"
JOSM_PATH="$HOME/.config/JOSM"
JOSM_FILE="$JOSM_PATH/preferences.xml"

HAS_PLUGINS=$(grep -c 'buildings_tools' "$JOSM_FILE")
HAS_REMOTE_CONTROL=$(grep 'remotecontrol.enabled' "$JOSM_FILE" | grep -c 'true')
HAS_OAUTH=$(grep -c 'oauth.access-token.key' "$JOSM_FILE")

cat > "$OUT_FILE" <<JSONFILE
{
 "has_plugins": ${HAS_PLUGINS},
 "remote_control": ${HAS_REMOTE_CONTROL},
 "logged_in": ${HAS_OAUTH}
}
JSONFILE
