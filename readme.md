#replicon
=======

General purpose command REPL for Node.js

### Installation

`npm install replicon --save`

### Example

	echo = function(){
		return console.log.apply(console, arguments);
	}

	var replicon = require('replicon');

	replicon
		.add('exit', function() {
			echo("Bye");
			process.exit();
		})
		.doc('exit', "\n\
			Exits this program.\n\
			\n\
				Syntax:\n\
			exit");

	replicon
		.add('echo', function(foo) {
			echo(foo);
		})
		.doc('echo', "\n\
			Outputs what is typed.\n\
			\n\
			Syntax:\n\
				echo Hello");