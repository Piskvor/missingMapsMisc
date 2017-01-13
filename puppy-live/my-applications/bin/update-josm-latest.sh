#!/bin/bash

cd `dirname $0`
wget --timestamping https://josm.openstreetmap.de/josm-tested.jar 
wget --timestamping https://josm.openstreetmap.de/josm-latest.jar
cd $HOME/my-documents/missingMapsMisc
git pull
exit $?

