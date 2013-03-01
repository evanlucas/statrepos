### Goal
Write something that would check for uncommitted changes in a list of repositories.

### Why?
Makes it easy at the end of the day to make sure all my work is committed.

### Dependencies
- [node.js](https://github.com/joyent/node)
- [commander.js](https://github.com/visionmedia/commander.js)
- [cli-table](https://github.com/LearnBoost/cli-table)
- [colors.js](https://github.com/marak/colors.js)

### Install

		git clone https://github.com/evanlucas/statrepos.git

Then, you can either install it (defaults to /usr/local/bin, and a helper lib to /usr/local/lib) or run it directly from where you cloned it.

I have included a (as you can see) very basic install script

### Usage

		./statrepos [-s|--status] [-v|--verbose] [-l|--list]
			[-a|--add <dir>] [-r|--remove <dir>]

			-s | --status		Checks the status of registered repositories
			-v | --verbose		... Verbose
			-l | --list			Lists registered repositories
			-a | --add <dir>	Add directory to be monitored
			-r | --remove <dir>	Remove directory from monitoring

Note: `-r` DOES NOT remove the directory.  It simply stops checking in that directory

### License
GPL
