Title: A Node powered Git blog using Wheat
Author: Davy De Waele
Date: Thu Apr 11 2013 23:30:00 GMT-0500 (EST)
Node: v0.8.15
Categories: node,blog,wheat

In this article I'll show you how to setup a Node / Git powered blog using the 
<a href="https://github.com/creationix/wheat/" target="_blank">Wheat engine</a> created by [Tim Caswell](https://twitter.com/creationix).

There are many Git based blog engines available (see references), but I opted for this one for a couple of reasons:

 - Node.js related features (supports node versions, node code snippets / online evaluation of code snippets / ...)
 - Supports categories (tags)
 - Is made by a great node developer

The idea is simple. We push content (blog articles) to a central Git repository (in this case Github). A post-receive gook on the git repository (GitHub calls them) is configured to POST data to a URL, allowing us to update a bare git repository on our blog server. The <a href="https://github.com/creationix/wheat/" target="_blank">Wheat engine</a> is a node process running on our blog server that reads the bare git repository, and serves up our blog pages.

![Git Powered Blog](https://dl.dropboxusercontent.com/u/13246619/Node/GitPoweredBlog/GitPoweredBlog.png)

##The content repository

The first thing we'll do is create a new git repository. 

I'll refer to this repository as the **content repository** as it will hold our blog content (primarily blog posts and author information.). Writers can clone or fork this repository and push their articles onto it.

The content repository will also be used to test the blog as the Wheat engine can be started in 2 modes

- **Development mode**

![Development mode](https://dl.dropboxusercontent.com/u/13246619/Node/GitPoweredBlog/git-node-wheat-development-mode.png)

In this mode, the wheat engine is started using the **content repository** and will pick up the content from the working directory. This allows us to test our blog without having to commit / push to the git repository. We simply edit our articles and the blog will be updated on the fly. In this mode no caching is applied in order to ensure that articles can be tested immediately without having to wait for a cache expiration.

- **Production mode**

![Production mode](https://dl.dropboxusercontent.com/u/13246619/Node/GitPoweredBlog/git-node-wheat-production-mode.png)

In this mode, the wheat engine is started using the **bare repository**. As the **bare repository** doesn't have a working copy of the files in the repository, the wheat engine will query the git repository objects directly, allowing it to apply aggresive caching on it. Every article corresponds to a [40 charachter checksun hash](http://git-scm.com/book/en/Git-Internals-Git-Objects) that never changes as long as the article is unchanged.

As content becomes available on this repository, we can pull it, and push it to a bare repository. The Wheat engine is configured to use this bare repository in order to render our blog as we'll see later on.


**Creating the git content repository**

You can either choose to create a new content repository yourself

	mkdir node-wheat-blog-template
	cd node-wheat-blog-template/
	git init
	Initialized empty Git repository in /Users/ddewaele/Projects/Node/node-wheat-blog-template/.git/

or you can simply clone [my blog repository](https://github.com/ddewaele/node-wheat-blog-template) to see how it works. It contains all the files that are discussed below.

	git clone https://github.com/ddewaele/node-wheat-blog-template
	cd node-wheat-blog-template/

##Our node module dependencies

In order for our Wheat powered blog to work, we need to install a couple of required node modules. This can be done manually by executing the commands below in the MyPersonalBlog folder you just created :

	npm install wheat
	npm install stack
	npm install creationix

When a valid [package.json](https://github.com/ddewaele/node-wheat-blog-template/blob/master/package.json) file is available in your git repository (and I invite you to download the one from my repository), installing the dependencies can be reduced to a single command:

	npm install

The package.json file looks like this:

	{
	  "name": "node-wheat-blog-template",
	  "version": "0.0.1",
	  "description": "A working template to start a node/wheat/git powered blog",
	  "main": "index.js",
	  "dependencies": {
	    "creationix": "~0.3.1",
	    "stack": "~0.1.0",
	    "wheat": "~0.2.6"
	  },
	  "devDependencies": {},
	  "scripts": {
	    "test": "echo \"Error: no test specified\" && exit 1"
	  },
	  "repository": {
	    "type": "git",
	    "url": "git@github.com:ddewaele/node-wheat-blog-template.git"
	  },
	  "engines": {
	    "node": ">=0.4.0"
	  },
	  "dependencies": {
	    "stack": ">=0.0.3",
	    "creationix": ">=0.1.2",
	    "wheat": ">=0.2.0",
	    "cluster": ">=0.6.4"
	  },
	  "devDependencies": {

	  },
	  "scripts": {
	    "start": "node server/server.js"
	  },
	  "keywords": [
	    "git",
	    "wheat",
	    "blog",
	    "node",
	    "gith"
	  ],
	  "author": "Davy De Waele",
	  "license": "BSD",
	  "readmeFilename": "README.md",
	  "gitHead": "8ffa229a0fa232f1ddda9530ddb849cd5d9fceee"
	}	


The output of the npm install should look like this:

	npm WARN prefer global forever@0.10.0 should be installed with -g
	stack@0.1.0 node_modules/stack

	creationix@0.3.1 node_modules/creationix
	└── simple-mime@0.0.8

	cluster@0.7.7 node_modules/cluster
	├── log@1.3.1
	└── mkdirp@0.3.5

	wheat@0.2.6 node_modules/wheat
	├── simple-mime@0.0.8
	├── proto@0.1.0
	├── git-fs@0.0.10
	├── step@0.0.5
	├── haml@0.4.3
	└── datetime@0.0.3 (vows@0.7.0)

	forever@0.10.0 node_modules/forever
	├── watch@0.5.1
	├── timespan@2.0.1
	├── pkginfo@0.2.3
	├── optimist@0.3.4 (wordwrap@0.0.2)
	├── utile@0.1.2 (deep-equal@0.0.0, rimraf@1.0.9, ncp@0.2.7, async@0.1.22, mkdirp@0.3.5, i@0.3.1)
	├── cliff@0.1.8 (eyes@0.1.8, colors@0.6.0-1)
	├── nssocket@0.3.8 (lazy@1.0.9, eventemitter2@0.4.11)
	├── nconf@0.6.1 (ini@1.1.0, async@0.1.22)
	├── winston@0.6.2 (cycle@1.0.2, stack-trace@0.0.6, eyes@0.1.8, colors@0.6.0-1, async@0.1.22, request@2.9.203)
	├── forever-monitor@1.0.1 (utile@0.0.10, minimatch@0.0.5, ps-tree@0.0.3, broadway@0.2.7)
	└── flatiron@0.2.3 (director@1.1.0, broadway@0.2.3, prompt@0.2.2)



##Ignoring unwanted files

After having installed the node module dependencies, your repository will contain a node_nodules folder. This is not something that we want to commit in our repository, so we'll opt to ignore it.

This is how my .gitignore file looks like. (as you can see, it ignores quite a lot of other files as well)

	Davys-MacBook-Air:MyPersonalBlog ddewaele$ cat .gitignore 
	lib-cov
	*.seed
	*.log
	*.csv
	*.dat
	*.out
	*.pid
	*.gz

	pids
	logs
	results

	npm-debug.log
	node_modules

(Github has [a dedicated repository](https://github.com/github/gitignore) for all kinds of programming languages. It's a good starting point for building your own gitignore files.)

##Articles, authors and skins

Our **content repository** also needs 3 other important folders so we need to create those as well :

 - articles
 - authors
 - skins

You can use the following command :

	mkdir articles ; mkdir authors ; mkdir skins

 - articles will hold our blog posts
 - authors will hold information about the authors (referenced from the article)
 - skins folder will contain our blow layout.

### Articles

Article pages are written in Markdown. The include some meta-data on top (author,title,categories,date...).
If you want to see the raw syntex of the [article you are reading now](https://raw.github.com/ddewaele/node-wheat-blog-template/master/articles/building-a-node-powered-blog.markdown), feel free to click the link.


	Title: Building a Node powered blog
	Author: Davy De Waele
	Date: Thu Apr 11 2013 23:30:00 GMT-0500 (EST)
	Node: v0.8.15
	Categories: node,blog,wheat

	In this article I'll show you how to setup a Node / Git powered blog using the ....

### Authors

Author pages are also written in Markdown. The follow the same structure as article pages but use different meta-data.

	Email: ddewaele@email.com
	Github: ddewaele
	Twitter: ddewaele
	Location: Belgium

	Author bio in Markdown format.

### Skins

The skins folder contains various haml templates for the blog. Haml is a templating language used in the Ruby world, but there is a [Haml version ported to server-side Javascript](https://github.com/creationix/haml-js). 

The Wheat engine uses a the haml templates to render the blog.

There's a haml template for 

 - article page
 - author page
 - blog layout
 - RSS feed
 - code snippets

## File system structure.

The final file system structure of the git content repository will look like this :


	./articles
	./articles/index.markdown
	./authors
	./authors/Davy De Waele.markdown
	./description.markdown
	./server
	./server/server.js
	./skin
	./skin/index.haml
	./skin/layout.haml

## Starting the blog in development mode

In order to start the blog we'll use a **[server.js](https://raw.github.com/ddewaele/node-wheat-blog-template/master/server/server.js)** node program that can be found in the **server** folder of the content repository.

The content of the server.js looks like this (Feel free to change the listen port, currently set at port 80):

	// Just a basic server setup for this site
	var Stack = require('stack'),
	    Creationix = require('creationix'),
	    Http = require('http');

	Http.createServer(Stack(
	  Creationix.log(),
	  require('wheat')(__dirname +"/..")
	)).listen(80);

Just enter the command below :

	node server/server.js

As you can see, it starts an HTTP server on port 80 with the Wheat blog engine.

When accessing the blog (http://localhost), you should see output similar to the one below in your console (meaning that everything is up and running).

	GET /content-syndication-with-node 200 Content-Type=text/html; charset=utf-8 Content-Length=20482
	GET /style.css 200 Content-Type=text/css Content-Length=11143
	GET /logo.png 200 Content-Type=image/png Content-Length=6076
	GET /groovepaper.png 200 Content-Type=image/png Content-Length=40723
	GET /print.css 200 Content-Type=text/css Content-Length=248


##The bare repository

Up until now, we have setup the required structure in our git content repository at add articles and start our blog. However, in order to have a production blog, we need to create our git bare repository. 

The bare repository is a second repository we need to create, this time on the server where the blog will be hosted.
Keep in mind that the **content repository** is something you clone on a local machine in order to edit / add content to the blog. The **bare repository** is used at runtime by the Wheat engine to serve up the blog posts to our users by fetching them from the bare git repository. Wheat is responsible for mapping your blog URLs to Git resources.

For those of you unfamiliar with git bare repositories, bare repositories only contain the .git folder and no working copies of the files in the repository. Bare repositories are primarily used for sharing, allowing different developers / teams to push their local repositories into the bare repositories. A bare repository cannot perform a git pull, as it doesn't have a working copy of the files.

We can clone our existing github repository as a bare-repository like this:

	git clone --bare git@github.com:ddewaele/node-wheat-blog-template.git
	Cloning into bare repository node-wheat-blog-template.git...
	remote: Counting objects: 20, done.
	remote: Compressing objects: 100% (8/8), done.
	remote: Total 20 (delta 2), reused 18 (delta 0)
	Receiving objects: 100% (20/20), done.
	Resolving deltas: 100% (2/2), done.


Notice how in contrast with a standard clone, cloning happens into a bare repository howtonode.org.git (**notice the .git suffix**). A standard clone would have said : "Cloning into howtonode.org..." (**notice the missing .git suffix**).

You can also turn a standard git repo into a bare one using the following commands :

	cd repo
	mv .git .. && rm -fr *
	mv ../.git .
	mv .git/* .
	rmdir .git

	git config --bool core.bare true
	cd ..; mv repo repo.git # renaming just for clarity

Once we have the bare repository setup, we need to execute a set of similar steps as we did before on the content blog. In short, we again need to 

- Install the node dependencies
- Setup a server.js file to bootstrap the Wheat engine


## Starting the blog "forever"

In order to ensure that our node program keeps running even when we exit the shell that started it we'll use the popular [forever module](https://github.com/nodejitsu/forever). The advantage of using Forever as opposed to simply starting the node file is that it will continue running even after you've exited the server shell. It also provides standard out and standard error logging.

So instead of calling the server/server.js directly, we're going to use the **[start.sh](https://raw.github.com/ddewaele/node-wheat-blog-template/master/start.sh)**  script that launches the forever module against our server.js.

	#!/bin/bash
	 
	# Invoke the Forever module (to START our Node.js server).
	./node_modules/forever/bin/forever \
	start \
	-al forever.log \
	-ao out.log \
	-ae err.log \
	server/server.js

###Committing and pushing content to the blog

So now that we have our blog up and running, we still need the ability to add content to it.

In order to add an article to our live-blog, we turn to our **content repository** and create a new markdown file in the articles folder (and a corresponding author markdown file as well if the author hasn't been defined yet.)

Once the files have been committed and pushed to the repo, we can pull in the changes on our server, and push them to our bare repository :

##GitHub WebHook URLs

GitHub offers a feature called WebHook URLs allowing you to add a url to take advantage of git’s post-receive hook. 
Github wil send a POST request containing data related to a repository push to that url.

![GitHub Webhooks](https://dl.dropboxusercontent.com/u/13246619/Node/GitPoweredBlog/GitHubWebHooks.png)

This is an ideal mechanism to use in our blog setup. In other words, when we push an article to our Github repository, a Webhook Url can be called, allowing us to update our bare git repository on our server.

We'll use <a href="https://github.com/danheberden/gith/blob/master/lib/gith.js" target="_blank">Gith</a>, a simple node server that responds to github post-receive events in order to update our bare git repository.

As soon as we push something to the GitHub repository the Webhook URL will be called, and we'll update the git bare repository by fetching the changes from the github repository using the following command:

	git fetch origin master:master


The [complete Github Webhook script](https://github.com/ddewaele/node-wheat-blog-template/blob/master/server/hook.js) is also in the github repository and contains the following code :


	// create a gith server on port 700
	var gith = require('gith').create( 7000 );

	gith({
	  repo: 'ddewaele/node-wheat-blog-template'
	}).on( 'all', function( payload ) {
		console.log( 'Post-receive form Github');

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


## Conclusion

The <a href="https://github.com/creationix/wheat/" target="_blank">Wheat engine</a> created by [Tim Caswell](https://twitter.com/creationix) allows us to power our blog using Git / Node.JS and that's a powerfull thing. 

Not only does it allow you to create and publish articles very easily (all it takes ia a push to your repository), it also allows you to open up your blog to other collaborators (much like howtonode.org is doing).

Also, as mentioned by the [Nodejitsu "Ten node applications that need to exist"](http://blog.nodejitsu.com/ten-node-apps-that-need-to-exist), Wheat is a great little git based blogging engine. (and Nodejitsu also uses it).

The downside of Wheat is that it's not actively maintained and there doesn't seem to a big eco-system behind it like Jekyll or Toto.

The ability to use a markup language like Markdown is also a nice change from the propriatary WYSIWYG editors found on most blogs.

Highly recommended !


##References

- [Howtonode.org code](https://github.com/creationix/howtonode.org)
- [gith github webhooks for node](http://weblog.bocoup.com/introducing-gith-github-webhooks-for-node/)
- [GitHub Post Receive Hooks](https://help.github.com/articles/post-receive-hooks)
- [Wheat on Windows Azure](https://github.com/woloski/nodeonazure-blog)
- [Wheat by creationix](https://github.com/creationix/wheat)
- [Node.JS library to read git repositories. ](https://github.com/creationix/node-git)
- [A simple CLI tool for ensuring that a given script runs continuously (i.e. forever) ](https://github.com/nodejitsu/forever)
- [Markdown reference](http://daringfireball.net/projects/markdown/basics)