#!/bin/bash

urxvt -e /bin/bash -c '/bin/bash /root/my-applications/bin/update-josm-latest.sh --all; /bin/ping -c 10 localhost >/dev/null 2>/dev/null'
