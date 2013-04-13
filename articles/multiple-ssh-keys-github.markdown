Title: Creating simple node modules
Author: Davy De Waele
Date: Thu Apr 11 2013 23:30:00 GMT-0500 (EST)

Multiple SSH key setup for Github



	#github account1
	Host github.com-account1
	    HostName github.com
	    User git
	    IdentityFile ~/.ssh/id_rsa_account1

	#github account2
	Host github.com-account2
	    HostName github.com
	    User git
	    IdentityFile ~/.ssh/id_rsa_account2



git@github.com-account1:ddewaele/node-wheat-blog-template.git

git@github.com:ddewaele/node-wheat-blog-template.git

chmod 600 ~/.ssh/config

sudo chmod 700  /home/ubuntu/.ssh/github/id_rsa

