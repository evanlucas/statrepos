var clc = require('cli-color'),
	red = clc.red.bold,
	yellow = clc.yellow.bold,
	cyan = clc.cyan.bold,
	magenta = clc.magenta.bold,
	util = require('util');

module.exports = {
	printError: function(msg) {
		console.log(red(msg));
	},
	
	printWarning: function(msg) {
		console.log(yellow(msg));
	},

	printInfo: function(msg) {
		console.log(cyan(msg));
	},

	printNotice: function(msg) {
		console.log(magenta(msg));
	},
	
	printTable: function(headers, rows) {
		var maxColWidth = 0;
		for (var i=0; i<rows.length; i++) {
			var o = rows[i];
			
		}
		console.log(clc.right(3)+'|'+clc.right(3));
		var header = headers.join('    |    ');
		var length = header.length;
		console.log(clc.underline.bold('    '+header+'                                  '));
		for (var i=0; i<rows.length; i++) {
			console.log(rows[i]);
		}
	}
}
