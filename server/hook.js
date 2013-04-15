// create a gith server on port 700
var gith = require('gith').create( 7000 );

gith({
  repo: 'ddewaele/node-wheat-blog-template'
}).on( 'all', function( payload ) {
	console.log( 'Post-receive form Github');
	//console.log("Payload = " + JSON.stringify(payload));

	// Execute a git fetch on the bare repo.
	var gitRepoPath = "/home/ubuntu/node/node-wheat-blog-template.git";
	var gitCommand = "git --git-dir " + gitRepoPath + " fetch origin master:master";

	var sys = require('sys')
	var exec = require('child_process').exec;
	var fetchOutput = exec(gitCommand, function puts(error, stdout, stderr) {
	        if (error) {
	            console.log('Error occured \n[' + error+']');
	        }
	}
	);

	fetchOutput.on('exit', function (code) {
		console.log('Child process exited with exit code '+code);
	});

});