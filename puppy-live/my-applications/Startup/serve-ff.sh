#!/bin/bash

/root/my-applications/bin/spot /root/my-applications/bin/serve-local-www.sh &
sleep 3
/root/my-applications/bin/spot /root/my-applications/bin/get-josm-user.sh
/root/my-applications/bin/foxspot
