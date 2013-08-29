#!/usr/bin/env node

/**
 *  Script to check the status of multiple git repositories
 *
 *  @date 3/1/13   
 *  @author Evan Lucas
 *  @copyright 2013 Evan Lucas
 */


var fs = require('fs')
  , util = require('util')
  , program = require('commander')
  , exec = require('child_process').exec
  , homedir = process.env['HOME']
  , colors = require('colors')
  , Table = require('cli-table')
  , logger = require('loggerjs')('StatRepos')
  
program
  .version('0.0.3')
  .usage('[options]')
  .option('-s, --status', 'Checks the status of registered repositories')
  .option('-v, --verbose', 'More verbose output')
  .option('-l, --list', 'Lists registered repositories')
  .option('-a, --add <dir>', 'Add directory to be monitored')
  .option('-r, --remove <dir>', 'Remove monitored repository from being checked.')
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
  @param {Function} cb function(err)
 */
var writeConfig = function(cb) {
  fs.writeFile(configPath(), JSON.stringify(config), function(err) {
    if (err) {
      logger.error('Error writing configuration')
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
    logger.error('Configuration does not exist')
    config.repos = [];
    logger.error('Please add at least one repository')
  } else {
    config = require(configPath());
  }
}

/**
  checks if given repo is a git repository
  @param {String} repo
  @result {Boolean}
 */
var isGitRepo = function(repo) {
  var lastChar = repo.substr(repo.length-1, 1);
  if (lastChar == '/') {
    repo += '.git';
  } else {
    repo += '/.git';
  }
  return fs.existsSync(repo);
}

/**
  checks if given repo is a fossil repository
  @param {String} repo
  @result {Boolean}
 */
var isFossilRepo = function(repo) {
  var lastChar = repo.substr(repo.length-1, 1);
  if (lastChar == '/') {
    repo += '.fslckout';
  } else {
    repo += '/.fslckout';
  }
  return fs.existsSync(repo);
}

/**
  gets the repository type
  @param {String} repo
  @result {String} type of repository
 */
var getRepoType = function(repo) {
  if (isGitRepo(repo)) {
    return 'GIT'.yellow;
  } else if (isFossilRepo(repo)) {
    return 'FOSSIL'.yellow;
  } else {
    return 'UNKNOWN'.yellow;
  }
}
/**
  check status for a single repository
  @param i {Integer} The index of the repository to stat
  @param cb {Function} function(err, data)
 */
var statRepo = function(i, cb) {

  var repo = config.repos[i];
  if (isGitRepo(repo)) {
    var cmd = 'cd '+repo+' && git status';
    var folder = repo.split('/');
    var foldername = folder[folder.length-1];
    var repoStatus = "CLEAN".magenta;
    var c = exec(cmd, function(err, stdout, stderr){
      if (err) {
        logger.error('Error executing: ', err)
        return cb(err); 
      } 
      if (stdout) {
        if (~stdout.indexOf('nothing to commit')) {
          return cb(null, {status: 'CLEAN'.magenta, name: repo, type: 'GIT'.yellow});
        } else {
          var output = {
            status: 'DIRTY'.red,
            message: stdout,
            name: repo,
            type: 'GIT'.yellow
          };
          return cb(null, output);
        }
      } else {
        logger.error('Error:', repo, stderr)
        return cb(stderr);
      }
    });
  } else if (isFossilRepo(repo)) {
    var cmd = 'cd '+repo+' && fossil changes';
    var folder = repo.split('/');
    var foldername = folder[folder.length-1];
    var repoStatus = "CLEAN".magenta;
    var c = exec(cmd, function(err, stdout, stderr) {
      if (err) {
        logger.error('Error executing: ', err)
        return cb(err);
      }
      
      if (stdout) {
        if (~stdout.indexOf('EDITED') || ~stdout.indexOf('DELETED') || ~stdout.indexOf('MISSING')) {
          var output = {
            status: 'DIRTY'.red,
            message: stdout,
            name: repo,
            type: 'FOSSIL'.yellow
          };
          return cb(null, output);
          
        } else {
          return cb(null, {status: 'DIRTY'.magenta, name: repo, type: 'FOSSIL'.yellow });
        }
      } else {
        return cb(null, {
          status: 'CLEAN'.magenta,
          name: repo,
          type: 'FOSSIL'.yellow
        });
      }
    });
  } else {
    logger.error(repo, 'does not appear to be a valid repository.')
    return cb({status: 'ERROR', name: repo, type: 'FOSSIL'.yellow });
  }
}

/**
  Check the status of ALL register repos
  @param i {Integer} The index to start at (should almost always be 0)
 */
var statRepos = function(i) {
  if (i < config.repos.length) {
    statRepo(i, function(err, data){
      var repo = config.repos[i];
      var repoType = getRepoType(config.repos[i]);
      if (err) {
        statusTable.push([i.toString(), 'ERROR', repo, repoType]);
      } else {
        if (data.status) {
          statusTable.push([i.toString(), data.status, repo, data.type]);
        } else {
          statusTable.push([i.toString(), 'ERROR', repo, repoType]);
        }
      }
      statRepos(i+1);
    });
  } else {
    console.log(statusTable.toString());
  }
}

readConfig();


/**
  Nothing valid is being passed, show usage
 */
if (!program.add && !program.remove && !program.status && !program.list) {
  program.help();
}

/**
  add repository to be registered
 */
if (program.add) {
  if (typeof program.add === 'string') {
    logger.info('[ADD]', program.add)
    if (!fs.existsSync(program.add)) {
      logger.error('[ADD]', program.add)
    } else {
      for (var i=0; i<config.repos.length; i++) {
        if (config.repos[i] == program.add) {
          logger.warn('[ADD]', program.add, 'is already being monitored')
          return;
        }
      }
      config.repos.push(program.add);
      writeConfig(function(err) {
        if (err) {
          process.exit(1);
        } else {
          if (program.verbose) {
            logger.info('[ADD]', program.add)
          }
        }
      });
    }
  } else {
    program.help();
  }
}

/**
  remove registration of given repository
 */
if (program.remove) {
  if (typeof program.remove === 'string') {
    logger.info('[REMOVE]', program.add)
    for (var a=0; a<config.repos.length; a++) {
      if (config.repos[a] == program.remove) {
        config.repos.splice(a, 1);
        logger.info('[REMOVE]', program.add)
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

/**
  get status of registered repositories
 */
if (program.status) {
  console.log('');
  logger.info('Fetching status of registered repositories')
  var statusTable = new Table({
    head: ['ID', 'Status', 'Path', 'Type']
  }); 
  statRepos(0);
}

/**
  list registered repositories
 */
if (program.list) {
  console.log('');
  logger.info('Registered Repositories')
  var table = new Table({
    head: ['ID', 'Path', 'Type']
  });
  
  for (var i=0; i<config.repos.length; i++) {
    var repo = config.repos[i];
    table.push([i.toString(), repo, getRepoType(repo)]);
  }
  
  console.log(table.toString());
}