### Goal
Write something that would check for uncommitted changes in a list of repositories.

### Why?
Makes it easy at the end of the day to make sure all my work is committed.

### Dependencies
- [node.js](https://github.com/joyent/node)
- [cli-color](https://github.com/medikoo/cli-color)

### Install

		git clone https://github.com/evanlucas/statrepos.git

Then, you can either install it (defaults to /usr/local/bin, and a helper lib to /usr/local/lib) or run it directly from where you cloned it.

I have included a (as you can see) very basic install script

### Usage

		./statrepos [-s|--status] [-v|--verbose] [-d|--detailed] [-l|--list]
			[-a|--add <dir>] [-r|--remove <dir>]

			-s | --status		Checks the status of registered repositories
			-v | --verbose		... Verbose
			-l | --list			Lists registered repositories
			-d | --detailed		Detailed output (requires -s)
			-a | --add <dir>	Add directory to be monitored
			-r | --remove <dir>	Remove directory from monitoring

Note: `-r` DOES NOT remove the directory.  It simply stops checking in that directory

### License
GPL
