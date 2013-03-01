#!/usr/bin/env node

/**
 *	Script to check the status of multiple git repositories
 *
 *	@date 3/1/13	 
 *	@author Evan Lucas
 *	@copyright 2013 Evan Lucas
 */


var fs = require('fs'),
	util = require('util'),
	program = require('commander'),
	exec = require('child_process').exec,
	homedir = process.env['HOME'],
	colors = require('colors'),
	Table = require('cli-table'),
	error = colors.red,
	warning = colors.yellow,
	info = colors.cyan,
	notice = colors.magenta;
	
program
	.version('0.0.2')
	.usage('[options]')
	.option('-s, --status', 'Checks the status of registered repositories')
	.option('-v, --verbose', 'More verbose output')
	.option('-l, --list', 'Lists registered repositories')
	.option('-a, --add [dir]', 'Add directory to be monitored')
	.option('-r, --remove [dir]', 'Remove monitored repository from being checked.')
	.parse(process.argv);


var config = {};

config.repos = [];

/**
  returns ~/statrepos.json
 */
var configPath = function() {
	return homedir +'/statrepos.json';
}

/**
  writes the config object to configPath()
 */
var writeConfig = function(cb) {
	fs.writeFile(configPath(), JSON.stringify(config), function(err) {
		if (err) {
			console.log(error('[statrepos] - Error writing configuration.'));
			return cb(err);
		} else {
			return cb(null);
		}
	});
}

/**
  reads config, creates it if it doesn't already exist
 */
var readConfig = function() {
	if (!fs.existsSync(configPath())) {
		console.log(error('[statrepos] - Configuration does not exist.'));
		config.repos = [];
		fs.writeFile(configPath(), JSON.stringify(config), function(err){
			if (err) {
				console.log(error('[statrepos] - Error writing configuration.'));
				process.exit(1);
			}
			
			if (program.verbose) {
				console.log(info('[statrepos] - Successfully wrote configuration.'));
			}
		});
	} else {
		config = require(configPath());
	}
}

/**
  check status for a single repository
  @param i {Integer} The index of the repository to stat
  @param cb {Function} function(err, data)
 */
var statRepo = function(i, cb) {
	var repo = config.repos[i];
	var cmd = 'cd '+repo+' && git status';
	var folder = repo.split('/');
	var foldername = folder[folder.length-1];
	var repoStatus = "CLEAN".magenta;
	var c = exec(cmd, function(err, stdout, stderr){
		if (err) {
			console.log('[statRepo] - ERROR - '+err);
			return cb(err);	
		} 
		if (stdout) {
			
			if (stdout.indexOf('nothing to commit (working directory clean)') != -1) {
				return cb(null, {status: 'CLEAN'.magenta, name: foldername});
			} else {
				var output = {
					status: 'DIRTY'.red,
					message: stdout,
					name: foldername
				};
				return cb(null, output);
			}
		} else {
			console.log('[statRepo] - '+foldername+' - '+stderr);
			return cb(stderr);
		}
	});
}

/**
  Check the status of ALL register repos
  @param i {Integer} The index to start at (should almost always be 0)
 */
var statRepos = function(i) {
	if (i < config.repos.length) {
		statRepo(i, function(err, data){
			var folder = config.repos[i].split("/");
			var foldername = folder[folder.length-1];
			if (err) {
				console.log('Error returned');
				statusTable.push([i.toString(), 'ERROR', foldername]);
			} else {
				if (data.status) {
					statusTable.push([i.toString(), data.status, foldername]);
				} else {
					statusTable.push([i.toString(), 'ERROR', foldername]);
				}
			}
			statRepos(i+1);
		});
	} else {
		console.log(statusTable.toString());
	}
}

readConfig();


if (!program.add && !program.remove && !program.status && !program.list) {
	program.help();
}


if (program.add) {
	if (typeof program.add === 'string') {
		console.log(notice('[statrepos] - [ADD] - ['+program.add+']'));
		if (!fs.existsSync(program.add)) {
			console.log(warning('[statrepos] - [ADD:ERROR] - ['+program.add+']'));
		} else {
			for (var i=0; i<config.repos.length; i++) {
				if (config.repos[i] == program.add) {
					console.log(warning('[statrepos] - [ADD:ERROR] - ['+program.add+' is already being monitored]'));
					return;
				}
			}
			config.repos.push(program.add);
			writeConfig(function(err) {
				if (err) {
					process.exit(1);
				} else {
					if (program.verbose) {
						console.log(info('[statrepos] - [ADD:SUCCESS] - ['+program.add+']'));	
					}
				}
			});
		}
	} else {
		program.help();
	}
}

if (program.remove) {
	if (typeof program.remove === 'string') {
		console.log(notice('[statrepos] - [REMOVE] - ['+program.remove+']'));
		for (var a=0; a<config.repos.length; a++) {
			if (config.repos[a] == program.remove) {
				config.repos.splice(a, 1);
				console.log(info('[statrepos] - [REMOVE:SUCCESS] - ['+program.remove+']'));
				writeConfig(function(err) {
					if (err) {
						process.exit(1);
					} else {
						return;
					}
				});
			}
		}
	} else {
		program.help();
	}
}


if (program.status) {
	console.log('');
	console.log(info('Fetching status of each registered repository'));
	console.log('');
	var statusTable = new Table({
		head: ['ID', 'Status', 'Path']
	});	
	statRepos(0);
}

if (program.list) {
	console.log('');
	console.log(info('Registered Repositories'));
	var table = new Table({
		head: ['ID', 'PATH']
	});
	
	for (var i=0; i<config.repos.length; i++) {
		var repo = config.repos[i];
		table.push([i.toString(), repo]);
	}
	
	console.log(table.toString());
}



