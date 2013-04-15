Title: Building a Node powered blog
Author: Davy De Waele
Date: Thu Apr 11 2013 23:30:00 GMT-0500 (EST)
Node: v0.8.15
Categories: node,blog,wheat

IMPORTANT : unfinished article !!! 

In this article I'll show you how to setup a Node / Git powered blog using the 
<a href="https://github.com/creationix/wheat/" target="_blank">Wheat engine</a> created by Tim Caswell.

There are many Git based blog engines available (see references), but I opted for this one for a couple of reasons:

 - Node.js related features (supports node versions, node code snippets / online evaluation of code snippets / ...)
 - Supports categories (tags)
 - Is made by a great node developer

The idea is simple. We push content (blog articles) to a central Git repository (in this case Github). A post-receive gook on the git repository (GitHub calls them) is configured to POST data to a URL, allowing us to update a bare git repository on our blog server. The <a href="https://github.com/creationix/wheat/" target="_blank">Wheat engine</a> is a node process running on our blog server that reads the bare git repository, and serves up our blog pages.

![Git Powered Blog](https://dl.dropboxusercontent.com/u/13246619/Node/GitPoweredBlog/GitPoweredBlog.png)

##The content repository

The first thing we'll do is create a new git repository.
This will be our **content repository** that holds our blog content (primarily blog posts and author information.). 
Writers can clone or fork this repository and push their articles onto it.
As content becomes available on this repository, we can pull it, and push it to a bare repository. The Wheat engine is configured to use this bare repository in order to render our blog.

The content repository can be hosted on Github or Bitbucket if you want to allow other people to provide content to it.

Creating the git repository:

	mkdir MyPersonalBlog
	cd MyPersonalBlog/
	git init
	Initialized empty Git repository in /Users/ddewaele/Projects/GitExperiments/MyPersonalBlog/.git/

##Our node module dependencies

In order for our Wheat powered blog to work, we need to install a couple of required node modules. This can be done manually by executing the commands below in the MyPersonalBlog folder you just created :

	npm install wheat
	npm install stack
	npm install creationix

When a valid [package.json](https://raw.github.com/ddewaele/node-wheat-blog-template/master/package.json) file is available in your git repository (and I invite you to download the one from my repository), installing the dependencies can be reduced to a single command:

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

##The bare repository

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


## Starting the blog

In order to start the blog, you need to have:

 - The necessary node module dependencies in place.
 - A bootstrap script available (in our case server/server.js and a shell script)

As discussed in the **content repository** section, if you place a package.json file in the root of the Bare repository, you can install all the required dependencies in one shot by executing the **npm install** command. The content of this package.json file can be found here :

	https://raw.github.com/ddewaele/node-wheat-blog-template/master/package.json


In order to start the server, we need to have the **[server.js](https://raw.github.com/ddewaele/node-wheat-blog-template/master/server/server.js)** file in the **server** folder. The content of the server.js can be found here.

The content of the server.js looks like this:

	// Just a basic server setup for this site
	var Stack = require('stack'),
	    Creationix = require('creationix'),
	    Http = require('http');

	Http.createServer(Stack(
	  Creationix.log(),
	  require('wheat')(__dirname +"/..")
	)).listen(80);

As you can see, it starts an HTTP server on port 80 with the Wheat blog engine.

When executing the server.js , you should see output similar to the one below in your console (meaning that everything is up and running).

	GET /content-syndication-with-node 200 Content-Type=text/html; charset=utf-8 Content-Length=20482
	GET /style.css 200 Content-Type=text/css Content-Length=11143
	GET /logo.png 200 Content-Type=image/png Content-Length=6076
	GET /groovepaper.png 200 Content-Type=image/png Content-Length=40723
	GET /print.css 200 Content-Type=text/css Content-Length=248

In order to ensure that our node program keeps running, we'll use the popular [forever module](https://github.com/nodejitsu/forever) to run our node program and keep it running. The advantage of using Forever as opposed to simply starting the node file is that it will continue running even after you've exited the server shell. It also provides standard out and standard error logging.

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

This is an ideal mechanism to use in our blog setup. In other words, when we push an article to our Github repository, a Webhook Url can be called, allowing us to update our bare git repository on our server.

We'll use <a href="https://github.com/danheberden/gith/blob/master/lib/gith.js" target="_blank">Gith</a>, a simple node server that responds to github post-receive events in order to update our bare git repository.

As soon as we push something to the GitHub repository the Webhook URL will be called, and we'll update the git bare repository.


	// create a gith server on port 7000
	var gith = require('gith').create( 7000 );

	gith({
	  repo: 'ddewaele/node-wheat-blog-template'
	}).on( 'all', function( payload ) {
	  console.log( 'Post-receive happened ...  time to update the blog....' );
		console.log("Payload = " + JSON.stringify(payload));

	});


As soon as we receive the payload in git, we need to fetch the changes into our bare git repository.

	git fetch origin master:master


In a setup where you aren't using Github, and you just have a git repo running on your server, 

	cd /home/user/blog
	git pull git@github.com:creationix/howtonode.org master
	git push ../howtonode.git



##References

- [Howtonode.org code](https://github.com/creationix/howtonode.org)
- [gith github webhooks for node](http://weblog.bocoup.com/introducing-gith-github-webhooks-for-node/)
- [GitHub Post Receive Hooks](https://help.github.com/articles/post-receive-hooks)
- [Wheat on Windows Azure](https://github.com/woloski/nodeonazure-blog)
- [Wheat by creationix](https://github.com/creationix/wheat)
- [Node.JS library to read git repositories. ](https://github.com/creationix/node-git)
- [A simple CLI tool for ensuring that a given script runs continuously (i.e. forever) ](https://github.com/nodejitsu/forever)