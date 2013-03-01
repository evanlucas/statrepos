#!/usr/bin/env node

/**
 *	Script to check the status of multiple git repositories
 *
 *	@date 3/1/13	 
 *	@author Evan Lucas
 *	@copyright 2013 Evan Lucas
 */


var fs = require('fs'),
	utils = require('../lib/util'),
	util = require('util'),
	exec = require('child_process').exec,
	homedir = process.env['HOME'],
	clc = require('cli-color'),
	cyan = clc.cyan.bold,
	magenta = clc.magenta.bold,
	red = clc.red.bold;

var programArgs = process.argv.splice(2);
var verbose = false,
	longOutput = false,
	shouldCheck = false,
	shouldAdd = false,
	shouldRemove = false,
	shouldList = false,
	reposToRemove = [],
	reposToAdd = [],
	config = {};

config.repos = [];
	

var usage = function(shouldContinue) {
	console.log("");
	utils.printWarning('Usage:');
	utils.printNotice('	./statrepos [-s|--status] [-v|--verbose] [-d|--detailed] [-l|--list] [-a|--add <dir>] [-r|--remove <dir>]');
	console.log("");
	utils.printNotice('		-s | --status			Checks the status of registered repositories');
	utils.printNotice('		-v | --verbose			Verbose');
	utils.printNotice('		-l | --list			Lists registered repositories');
	utils.printNotice('		-d | --detailed			Detailed output'); 
	utils.printNotice('		-a | --add <dir>		Add directory to be monitored.');
	utils.printNotice('		-r | --remove <dir>		Remove monitored repository from being check.');
	if (!shouldContinue) {
		process.exit(1);
	}
}

var getSpace = function(count) {
	var s = "";
	for (var i=0; i<count; i++) {
		s += " ";
	}
	return s;
}

var processArgs = function() {
	for (var i=0; i<programArgs.length; i++) {
		var arg = programArgs[i];
		if (arg == '-v' || arg == '--verbose') {
			verbose = true;
		} else if (arg == '-d' || arg == '--detailed') {
			longOutput = true;
		} else if (arg == '-l' || arg == '--list') {
			shouldList = true;
		} else if (arg == '-s' || arg == '--status') {
			shouldCheck = true;
		} else if (arg == '-r' || arg == '--remove') {
			shouldRemove = true;
			if (programArgs.length > i+1) {
				reposToRemove.push(programArgs[i+1]);
			} else {
				utils.printError('[statrepos] - Removing a repository requires the repository path');
				usage(false);
			}
		} else if (arg == '-a' || arg == '--add') {
			shouldAdd = true;
			if (programArgs.length > i + 1) {
				reposToAdd.push(programArgs[i+1]);
			} else {
				utils.printError('[statrepos] - Adding a repository requires the repository path.');
				usage(false);
			}
		}
	}
}

/**
  returns ~/statrepos.json
 */
var configPath = function() {
	return homedir +'/statrepos.json';
}

/**
  reads config, creates it if it doesn't already exist
 */
var readConfig = function() {
	if (!fs.existsSync(configPath())) {
		utils.printError('[statrepos] - Configuration does not exist.');
		config.repos = [];
		console.log(JSON.stringify(config));
		fs.writeFile(configPath(), JSON.stringify(config), function(err){
			if (err) {
				utils.printError('[statrepos] - Error writing configuration.');
				process.exit(1);
			}
			
			if (verbose) {
				utils.printInfo('[statrepos] - Successfully wrote configuration.');
			}
		});
	} else {
		config = require(configPath());
	}
}

/**
  check status for a single repository
  @param repo {String} The full path to the repository
  @param lo {Boolean} Whether to output longOutput
  @param cb {Function} function(err, data)
 */
var statRepo = function(repo, lo, cb) {
	var cmd = 'cd '+repo+' && git status';
	var folder = repo.split('/');
	var foldername = folder[folder.length-1];
	var repoStatus = "clean";
	var c = exec(cmd, function(err, stdout, stderr){
		if (err) return cb(err);
		if (stdout) {
			if (stdout.indexOf('nothing to commit (working directory clean)') != -1) {
				return cb(null, {status: 'clean', name: foldername});
			} else {
				var output = {
					status: 'dirty',
					message: stdout,
					name: foldername
				};
				return cb(null, output);
			}
		}
	});
}

/**
  checks status for all registered repositories
 */
var statRepos = function() {
	if (verbose) {
		console.log("");
		utils.printInfo('Checking status of registered repositories');
	}
	utils.printNotice('Count: '+config.repos.length);
	console.log("");
	if (config && config.repos) {
		if (config.repos.length == 0) {
			utils.printWarning('[statrepos] - There are no registered repositories to stat.');
			process.exit(1);
		}
	} else {
		utils.printError('[statrepos] - Cannot read configuration.');
		utils.printInfo('[statrepos] - Please make sure you have added at least 1 repository.');
		process.exit(1);
	}
	for (var i=0; i<config.repos.length; i++) {
		var repo = config.repos[i];
		statRepo(repo, longOutput, function(err, status){
			if (err) {
				utils.printError('[statrepos] - Error getting repository statistics.');
				return;
			}
			//var output = JSON.parse(status);

			if (status) {
				if (status.status == 'clean') {
					console.log(cyan('[statrepos] - ['+status.name+']')+ '::'+magenta('CLEAN'));
				} else {
					if (status.status == 'dirty') {
						console.log(cyan('[statrepos] - ['+status.name+']')+ '::'+red('DIRTY'));
						if (longOutput) {
							utils.printInfo('		\\\\//	');
							console.log(status.message);
						}
					}
				}	
			} else {
				utils.printError('[statrepos] - An error occurred reading status of repository');
			}
			
		});
	}
}

readConfig();
processArgs();

if (!shouldAdd && !shouldRemove && !shouldCheck && !shouldList) {
	usage(false);
}

if (shouldAdd) {
	for (var i=0; i<reposToAdd.length; i++) {
		var repo = reposToAdd[i];
		utils.printNotice('[statrepos] - Attempting to add repository at path ['+repo+']');
		if (!fs.existsSync(repo)) {
			utils.printWarning('[statrepos] - ['+repo+'] does not exist.');
		} else {
			config.repos.push(repo);
		}
	}
	
	fs.writeFile(configPath(), JSON.stringify(config), function(err){
		if (err) {
			utils.printError('[statrepos] - Error saving configuration.');
			process.exit(1);
		}
		utils.printInfo('[statrepos] - Repositories successfully added.');
		if (verbose) {
			utils.printNotice('[statrepos] - Run again to get stats.');
		}
		process.exit(1);
	});
	
}

if (shouldRemove) {
	for (var i=0; i<reposToRemove.length; i++) {
		var repo = reposToRemove[i];
		utils.printNotice('[statrepos] - Attempting to remove repository at path ['+repo+']');
		for (var a=0; a<config.repos.length; a++) {
			if (config.repos[a] == repo) {
				config.repos.splice(a, 1);
			}
		}
	}
	
	fs.writeFile(configPath(), JSON.stringify(config), function(err){
		if (err) {
			utils.printError('[statrepos] - Error writing configuration.');
			process.exit(1);
		}
		
		if (verbose) {
			utils.printInfo('[statrepos] - Successfully wrote configuration.');
		}
		
		config = require(configPath());
	});
	
}

if (shouldCheck) {
	statRepos();
}


var padString = function(string, length) {
	var s = "";
	if (string.length < length) {
		if (string.length % 2 == 0) {
			s += getSpace((length - string.length)/2);
			s += string;
			s += getSpace((length - string.length)/2);
		} else {
			s += getSpace(((length - string.length)/2)-1);
			s += string;
			s += getSpace((length - string.length)/2);
		}
	}
	
	return s;
}
if (shouldList) {
	var maxWidth = 0;
	for (var i=0; i<config.repos.length; i++) {
		var repo = config.repos[i];
		if (repo.length > maxWidth) {
			maxWidth = repo.length;
		}
	}
	
	console.log("");
	utils.printInfo('Registered Repositories');
	utils.printNotice("Count: "+config.repos.length);
	console.log(clc.underline(getSpace(maxWidth+12)));
	console.log(clc.underline('|'+getSpace(2)+'ID'+getSpace(2)+'|'+getSpace(2)+'PATH'+getSpace(maxWidth-3)+'|'));
	for (var i=0; i<config.repos.length; i++) {
		var repo = config.repos[i];
		var right = (i.toString().length == 1) ? 3 : 2;
		if (i == config.repos.length-1) {
			console.log(clc.underline('|'+getSpace(2)+i.toString()+getSpace(right)+'|'+getSpace(2)+repo+getSpace(maxWidth-repo.length+1)+'|'));
		} else {
			console.log('|'+getSpace(2)+i.toString()+getSpace(right)+'|'+getSpace(2)+repo+getSpace(maxWidth-repo.length+1)+'|');
		}
	}
}


