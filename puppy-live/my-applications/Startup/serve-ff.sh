#!/bin/bash

/root/my-applications/bin/spot /root/my-applications/bin/serve-local-www.sh &
sleep 2
/root/my-applications/bin/spot /root/my-applications/bin/get-josm-user.sh
sleep 1
/root/my-applications/bin/foxspot
