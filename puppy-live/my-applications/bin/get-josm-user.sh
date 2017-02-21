#!/bin/bash

if [ "$1" != "" ] ; then
    FORCE_SET_RUNNING=$1
else
    FORCE_SET_RUNNING=0
fi

TMP="/tmp"
if [ -d "$HOME/tmp" ] ; then
    TMP="$HOME/tmp"
fi
OUT_FILE="$HOME/Web-Server/local.json"
JOSM_PATH="$HOME/.config/JOSM"
JOSM_FILE="$JOSM_PATH/preferences.xml"

if [ ! -f "$JOSM_FILE" ] ; then
    echo "no $JOSM_FILE"
    exit 1
fi
HAS_ALL_PLUGINS=0
HAS_BUILDINGS_TOOLS=$(grep -c 'buildings_tools' "$JOSM_FILE")
if [ "$HAS_BUILDINGS_TOOLS" ] ; then
    HAS_ALL_PLUGINS=1
fi
HAS_REMOTE_CONTROL=$(grep 'remotecontrol.enabled' "$JOSM_FILE" | grep -c 'true')
HAS_OAUTH=$(grep -c 'oauth.access-token.key' "$JOSM_FILE")
if [ "$FORCE_SET_RUNNING" = 1 ] ; then
    IS_RUNNING=1
else
    if [ "$FORCE_SET_RUNNING" = -1 ] ; then
        IS_RUNNING=0
    else
        PID=$(find ${TMP}/josm* -name 'josm*-runner.pid' -exec cat {} \; 2>/dev/null)
        if [ "$PID" != "" ] ; then
            IS_RUNNING=$(ps -p "$PID" -o pid= | wc -l)
        fi
    fi
fi
if [ "$IS_RUNNING" = "" ] ; then
    IS_RUNNING=0
fi

cat > "$OUT_FILE" <<JSONFILE
{
 "is_installed": "1",
 "buildings_tools": "${HAS_BUILDINGS_TOOLS}",
 "has_all_plugins": "${HAS_ALL_PLUGINS}",
 "remote_control": "${HAS_REMOTE_CONTROL}",
 "logged_in": "${HAS_OAUTH}",
 "is_running": "${IS_RUNNING}"
}
JSONFILE
