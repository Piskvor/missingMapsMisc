#!/bin/sh

cd /root/Web-Server
if [ "$1" = "--debug" ]; then 
	/usr/bin/python /root/my-applications/bin/serve-local.py
else
	/usr/bin/python /root/my-applications/bin/serve-local.py >/dev/null 2>/dev/null 
fi
