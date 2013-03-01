#!/bin/bash

source colors.bash

printInfo "Installing statrepos"

cp ./lib/util.js /usr/local/lib/
cp ./bin/statrepos.js /usr/local/bin/statrepos

printInfo "statrepos successfully installed :]"
