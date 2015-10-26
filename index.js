var readline = require('readline');


/**
 * Init
 */

var rl = readline.createInterface({
	input: process.stdin, 
	output: process.stdout,
	completer: completer
});

rl
	.on('line', processLine)
	.on('close', function() {
		echo('')
		process.exit(0);
	});

rl.setPrompt('# ');
rl.prompt();


/**
 * Private Variables
 */

var _commands = {},
	_docs = {};


/**
 * Private Methods
 */

function completer(line) {
	var completions = Object.keys(_commands);
	var hits = completions.filter(function(c) { return c.indexOf(line) == 0 })
	// show all completions if none found
	return [hits, line]
}

function processLine(line){
	var args = prepareArgs(line);
	
	var	commandName = args.shift(),
		args = washArguments(args);
	
	var command = _commands[commandName];

	if (typeof command === 'function') {
		var cb = command.apply(null, args);
		
		// When command returned a function, it means command is async
		if (typeof cb === 'function') {
			// Pause the readline interface...
			rl.pause();
			// ...until command is finished
			cb(function(err, output){
				if (err) echo(err);
				
				if (typeof output !== 'undefined') echo(output);
				
				rl.prompt();
			});
		}
		else {
			// Otherwise, the command already executed, therefore initiate another prompt
			rl.prompt();
		}
	}
	else if (typeof commandName == 'undefined') // User just pressed enter, just repompt - Bash does this
	{
		rl.prompt();
	}
	else
	{
		echo("Command not found: "+commandName);
		rl.prompt();
	}
}

function prepareArgs(line){
	var args = [];
	
	// Created an array were even elements are double-quoted strings
	var stripedArray = line.split('"');
	
	// Transform striped array into final args array
	stripedArray.forEach(function(e, i){
		// Don't process even elements because even elements are strings
		if (i % 2) {
			// Even elements are directly pushed into args array (don't mess with a string's spaces).
			// However, add the double quotes back to explicitly say this is a string type
			args.push('"'+e+'"');
		}
		else {
			// Odd elements are processed for spaces and then concatenated to args
			e = e.trim();
			if (e) {
				args = args.concat(e.split(/\s+/));
			}
		}
	});
	
	return args;
}

function washArguments(args){
	var washedArgs = [];
	
	args.forEach(function(arg){
		arg = arg.trim();
		
		// Numbers
		if (/^\d+(\.\d+)?$/.test(arg)) {
			arg = Number(arg);
		}
		// Explicit Strings
		else if (/^".*"$/.test(arg)) {
			arg = arg.substring(1, arg.length-1)
		}
		
		washedArgs.push(arg);
	});
	
	return washedArgs;
}

function echo(){
	console.log.apply(console, arguments);
}


/**
 * Public Methods
 */

exports.add = function(commandName, fn){
	_commands[commandName] = fn;
	return exports;
};

exports.doc = function(commandName, docs){
	// Support for removal of preceeding tabs/spaces on multi-line strings
	// For mult-line tab/space truncation, strings must begin with a new-line
	if (docs[0] === '\n') {
		var measurements = /^\n(\t+|\s+)/.exec(docs);
		docs = docs.replace(RegExp(measurements[0]), '').replace(RegExp(measurements[1], 'g'), '');
	}
	
	_docs[commandName] = docs;
	
	return exports;
};


/**
 * Built-in Commands
 */

exports.add('help', function(commandName){
	if (!commandName) {
		var methods = Object.keys(_commands);
		
		echo("Available commands: \n");
		echo(methods.join(', ')+"\n");
		echo("Type `help command` for more information.");
	}
	else {
		var command = _commands[commandName]
		
		if (typeof command !== 'function')
			return echo("Command not found: "+commandName);
		
		if (_docs[commandName]) {
			echo(_docs[commandName]);
		}
		else {
			var sig = /^function\s*\(([^)]*)\)/.exec(command.toString())[1].replace(',', '');

			echo([commandName, sig].join(' '));
		}
	}
});