### Goal
Write something that would check for uncommitted changes in a list of repositories.

### Why?
Makes it easy at the end of the day to make sure all my work is committed.

### Details
Checks the status for repositories using the following version control systems
- Git
- Fossil

### Dependencies
- [node.js](https://github.com/joyent/node)
- [commander.js](https://github.com/visionmedia/commander.js)
- [cli-table](https://github.com/LearnBoost/cli-table)
- [colors.js](https://github.com/marak/colors.js)

### Install

		git clone https://github.com/evanlucas/statrepos.git

Then, you can either install it (defaults to /usr/local/bin, or run it directly from where you cloned it.

I have included a (as you can see) very basic install script

### Usage

		./statrepos [options]
		
		Options:
		
		
			-h | --help			output usage information
			-V | --version		output the version number
			-s | --status		Checks the status of registered repositories
			-v | --verbose		More verbose output
			-l | --list			Lists registered repositories
			-a | --add <dir>	Add directory to be monitored
			-r | --remove <dir>	Remove directory from monitoring

Note: `-r` DOES NOT remove the directory.  It simply stops checking in that directory

### License
GPL
