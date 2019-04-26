#!/bin/bash

#set -o errexit
set -o errtrace
set -o nounset
set -o pipefail
#set -o xtrace

cd "$(dirname $0)"
BASE_NAME=$(basename $0)
TMP="/tmp"
if [[ -d "$HOME/tmp" ]] ; then
    TMP="$HOME/tmp"
fi
TMPDIR="$TMP/${BASE_NAME}-${USER}"
TMPFILE="${TMPDIR}/${BASE_NAME}-runner.pid"

# clean up the directory
function cleanup {
	rmdir "${TMPDIR}"
}

# lock using a directory: http://unix.stackexchange.com/a/180028/5477
if mkdir $TMPDIR 2>/dev/null; then
	trap "cleanup" EXIT

    wget --timestamping --quiet https://josm.openstreetmap.de/josm-tested.jar &
    wget --timestamping --quiet https://josm.openstreetmap.de/josm-latest.jar &
    cd /home/spot/missingMapsMisc
    git pull --force
    chown -R spot. .
    spot rsync $(pwd)/offlineLandingPage/* /home/spot/Web-Server -avP --no-owner --no-group
    wait
    touch /root/Web-Server/local.json
    chown spot. /root/Web-Server/local.json
    /root/bin/spot /root/bin/get-josm-user.sh
    echo "Done."
    exit $?
else
    echo "Already running"
    exit 1
fi
