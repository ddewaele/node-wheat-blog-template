Title: Building a Node powered blog
Author: Davy De Waele
Date: Thu Apr 11 2013 23:30:00 GMT-0500 (EST)
Node: v0.8.15
Categories: node,blog,wheat

Here is some intro text.

In this article I'll show you how to setup a Node / Git powered blog using the 
<a href="https://github.com/creationix/wheat/" target="_blank">Wheat engine</a> created by Tim Caswell.

There are many Git based blog engines available (see references), but I opted for this one for a couple of reasons:

 - Node.js related features (supports node versions, node code snippets / online evaluation of code snippets / ...)
 - Supports categories (tags)
 - Is made by a great node developer

The idea is simple... You push content (blog articles) to a GitHub repository. A service hook on the GitHub repository
is setup to trigger a pull to a local repository on the blog server. From that local repository, a push is executed to a bare git repository on the same server, where the Wheat engine is running.

![Git Powered Blog](https://dl.dropboxusercontent.com/u/13246619/Node/GitPoweredBlog/GitPoweredBlog.png)

##The content repository

The first thing we need to do is create a new git repository.
This will be our **content repository** that holds our blog content (primarily blog posts and author information.). 
Writers can clone or fork this repository and push their articles onto it.
As content becomes available on this repository, we can pull it, and push it to a bare repository. The Wheat engine is configured to use this bare repository in order to render our blog.

The content repository can be hosted on Github or Bitbucket if you want to allow other people to provide content to it.

Creating the git repository:

	Davys-MacBook-Air:GitExperiments ddewaele$ pwd
	/Users/ddewaele/Projects/GitExperiments
	Davys-MacBook-Air:GitExperiments ddewaele$ mkdir MyPersonalBlog
	Davys-MacBook-Air:GitExperiments ddewaele$ cd MyPersonalBlog/
	Davys-MacBook-Air:MyPersonalBlog ddewaele$ git init
	Initialized empty Git repository in /Users/ddewaele/Projects/GitExperiments/MyPersonalBlog/.git/

In order for our Wheat powered blog to work, we need to install a couple of required node modules. This can be done manually like this :

	npm install wheat
	npm install stack
	npm install creationix

Or when a valid package.json file is available in your git repository can simple be done by executing the command below:

	npm install

After installing the node module dependencies, your repository will contain a node_nodules folder. This is not something that we necessarily want to checkin in our repository, so we'll opt to ignore it.

This is how my .gitignore file looks like. 

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


Our content repository also needs 3 other important folders so we need to create those as well :

 - articles
 - authors
 - skins

You can use the following command :

	mkdir articles ; mkdir authors ; mkdir skins

The articles will hold our blog posts, the authors will hold information about the authors (referenced from the article), and the skins folder will contain our blow layout.

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
Where-as the content repository is something you clone on a local machine in order to edit / add content to the blog, this bare repository is used at runtime by the Wheat engine to server the blog posts to our users by fetching them from the bare git repository. Wheat is responsible for mapping your blog URLs to Git resources.

Bare repositories only contain the .git folder and no working copies of the files in the repository. Bare repositories are primarily used for sharing, allowing different developers / teams to push their local repositories into the bare repositories. A bare repository cannot perform a git pull, as it doesn't have a working copy of the files.

We can clone our existing github repository as a bare-repository like this:

	ubuntu@domU-12-31-39-09-25-44:~/node$ git clone --bare git@github.com:ddewaele/node-wheat-blog-template.git
	Cloning into bare repository node-wheat-blog-template.git...
	remote: Counting objects: 20, done.
	remote: Compressing objects: 100% (8/8), done.
	remote: Total 20 (delta 2), reused 18 (delta 0)
	Receiving objects: 100% (20/20), done.
	Resolving deltas: 100% (2/2), done.


Notice how in contrast with a standard clone, cloning happens into a bare repository howtonode.org.git (**notice the .git suffix**).

A standard clone will simply say : "Cloning into howtonode.org..." (**notice the missing .git suffix**).

You can also turn a standard git repo into a bare one using the following commands :

	cd repo
	mv .git .. && rm -fr *
	mv ../.git .
	mv .git/* .
	rmdir .git

	git config --bool core.bare true
	cd ..; mv repo repo.git # renaming just for clarity


In order to start the blow, you need to have

-The necessary node module dependencies in place.
-A bootstrap script available (in our case server/server.js + a shell script)

If you place a package.json file in the root of the Bare repository, you can install all the required dependencies in one shot by executing the **npm install** command. The content of this package.json file can be found here :

	https://raw.github.com/ddewaele/node-wheat-blog-template/master/package.json

Embedded content :

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

In order to start the server, we need to have the **server.js** file in the **server** folder. The content of the server.js can be found here.

https://raw.github.com/ddewaele/node-wheat-blog-template/master/server/server.js

Content :

	// Just a basic server setup for this site
	var Stack = require('stack'),
	    Creationix = require('creationix'),
	    Http = require('http');

	Http.createServer(Stack(
	  Creationix.log(),
	  require('wheat')(__dirname +"/..")
	)).listen(80);

As you can see, it starts an HTTP server on port 80 with the Wheat blog engine.

When you access your blog using the following URL :
http://localhost:3334/content-syndication-with-node

You'll see that the server generates the following output :

	GET /content-syndication-with-node 200 Content-Type=text/html; charset=utf-8 Content-Length=20482
	GET /style.css 200 Content-Type=text/css Content-Length=11143
	GET /logo.png 200 Content-Type=image/png Content-Length=6076
	GET /groovepaper.png 200 Content-Type=image/png Content-Length=40723
	GET /print.css 200 Content-Type=text/css Content-Length=248



### Committing and pushing content to the blog

In order to add an article to our live-blog, we create a new markdown file in the articles folder (and a corresponding author markdown file as well if the author hasn't been defined yet.)

Once the files have been committed and pushed to the repo, we can pull in the changes on our server, and push them to our bare repository :


GitHub offers a feature called WebHook URLs. It allows you to add a url to take advantage of git’s post-receive hook. 
Github wil send a POST request containing data related to a repository push.

In other words, when we push an article to our Github repository, the Webhook Url is called, allowing us to update our bare git repository on our server.

We'll use <a href="https://github.com/danheberden/gith/blob/master/lib/gith.js" target="_blank">Gith</a>, a simple node server that responds to github post-receive events in order to update our bare git repository.

As soon as we push something to the GitHub repository the Webhook URL will be called, and we'll update the git bare repository.

This is done using the following command

	git fetch origin master:master


In a setup where you aren't using Github, and you just have a git repo running on your server, 

	cd /home/user/blog
	git pull git@github.com:creationix/howtonode.org master
	git push ../howtonode.git








##References

- https://github.com/creationix/howtonode.org
- https://github.com/woloski/nodeonazure-blog
- https://github.com/creationix/wheat
- https://github.com/creationix/node-git
