#!/bin/bash

source colors.bash


printInfo "Checking for depends"

NPM=$(which npm > /dev/null 2>&1)

if [[ $? == 1 ]]; then
	printError "Unable to find npm"
	printError "Please make sure it is in your \$PATH"
fi

npm install -g cli-table commander colors

if [[ $? == 1 ]]; then
	printError "npm returned errors"
	exit 1
fi

printInfo "Installing statrepos"

cp ./bin/statrepos.js /usr/local/bin/statrepos

printInfo "statrepos successfully installed :]"
