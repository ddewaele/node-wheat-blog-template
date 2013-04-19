Title: Setting up SSH access to your server
Author: Davy De Waele
Date: Thu Apr 11 2013 23:30:00 GMT-0500 (EST)
Node: v0.8.15
Categories: ssh,security,authentication,centos,linux

A couple of days ago I placed an order for a dedicated server with a hosting company.
When my server was ready, I received an email with the server connection properties (ip address, ssh port, root password). I was naturally encouraged to change the generated root password as soon as possible but decided to go the extra mile and set it up in a more secure way. 

Following is a list of steps I executed to ensure that remotely accessing the server is a bit more secure.

##Have strong passwords in place

Regardless of how people access our server from the outside, internally, all users will still have a password associated with them. Make sure you use strong passwords.

## Using a non-standard SSH port.

The internet is flooded with automated programs (botnets) that scan the entire internet for SSH enabled boxes and tries to guess username / password combinations for these boxes (Linux/Unix servers, routers or other network devices).

When they start hammering your server, this is what you typically see in the logfiles:

	Apr 17 21:35:52 domU-xx-xx-xx-xx-xx-xx sshd[13829]: Invalid user sixnetqos from 112.220.201.150
	Apr 17 21:35:59 domU-xx-xx-xx-xx-xx-xx sshd[13831]: Invalid user telindus from 112.220.201.150
	Apr 17 21:36:05 domU-xx-xx-xx-xx-xx-xx sshd[13833]: Invalid user olga from 112.220.201.150
	Apr 17 21:36:12 domU-xx-xx-xx-xx-xx-xx sshd[13835]: Invalid user media from 112.220.201.150
	Apr 17 21:36:19 domU-xx-xx-xx-xx-xx-xx sshd[13837]: Invalid user mediadom from 112.220.201.150
	Apr 17 21:36:26 domU-xx-xx-xx-xx-xx-xx sshd[13839]: Invalid user office from 112.220.201.150
	Apr 17 21:36:33 domU-xx-xx-xx-xx-xx-xx sshd[13841]: Invalid user recepta from 112.220.201.150
	Apr 17 21:36:40 domU-xx-xx-xx-xx-xx-xx sshd[13843]: Invalid user remedium from 112.220.201.150
	Apr 17 21:36:47 domU-xx-xx-xx-xx-xx-xx sshd[13845]: Invalid user spam from 112.220.201.150
	Apr 17 21:36:54 domU-xx-xx-xx-xx-xx-xx sshd[13847]: Invalid user wwwadmin from 112.220.201.150
	Apr 17 21:37:07 domU-xx-xx-xx-xx-xx-xx sshd[13851]: Invalid user broadcom from 112.220.201.150
	Apr 17 21:37:14 domU-xx-xx-xx-xx-xx-xx sshd[13853]: Invalid user tnc from 112.220.201.150
	Apr 17 21:37:21 domU-xx-xx-xx-xx-xx-xx sshd[13855]: Invalid user goodweb from 112.220.201.150
	Apr 17 21:37:28 domU-xx-xx-xx-xx-xx-xx sshd[13857]: Invalid user people from 112.220.201.150
	Apr 17 21:37:35 domU-xx-xx-xx-xx-xx-xx sshd[13859]: Invalid user testnstudy from 112.220.201.150

Even if they don't manage to get into your server, they clutter up your logfiles and it is something that you can avoid relatively easily.
Changing the default SSH port that the  server is listening on (default = 22) for SSH access is one of the measures we can take.
A lot of people change their SSH port to 2022, so that has become another popular target port for botnets, so best is to take a random port.

Here we'll just pick a randon port (2347).

In order to change the port we need to edit the file below: 

	vi /etc/ssh/sshd_config 

Change the line that reads Port 22 to another port number

	Port 2347

And restart the ssh daemon
	
	/etc/init.d/sshd restart 

As port scanning can be time-consuming, you should see a dramatic de-crease in the number of login attempts by making this simple change.

Before changing your SSH port, make sure that there are no fire-wall rules preventing you from accessing this port from the outside. (to avoid getting locked out of your own server)


##SSH Public Key Based Authentication

Username / password authentication is by far the most popular way of proving our identity to a remote system. It is unfortunately also a very weak way of performing authentication. 

Most people like to use their own name as a username making it easy for automated systems to attack common names. 

The same thing happens with passwords. People like to choose passwords they can remember (using passwords based on dictionary words). After all, it's a lot easier to remember your cats name then it is to remembe something like af53!fkP.

Unfortunately, even **af53!fkP** can be "hacked" relatively easily using brute force attacks. 

We're going to configure the server to **not** use password authentication, but rather use public key authentication. 

###Generating a key-pair 

We'll start by generating a key-pair. The private key will be kept with us (on our machine, or on a USB stick), while the public key will be sent to the server.

On a client machine (typically your machine, the machine you'll use to login to the server), execute the following commands :

	mkdir -p ~/.ssh/hetzner_ex4
	ssh-keygen -t rsa -f ~/.ssh/hetzner_ex4/id_rsa

This will generate 2 files in the ~/.ssh/hetzner_ex4 folder :

	ls -l ~/.ssh/hetzner_ex4 
	total 16
	-rw-------  1 ddewaele  staff  1675 Apr 17 12:20 id_rsa
	-rw-r--r--  1 ddewaele  staff   414 Apr 17 12:20 id_rsa.pub


- The id_rsa file is your private key, and needs to be kept safe at all time.
- The id_rsa.pub file is your public key. This is the key that can be freely distributed with anyone interested.

**Note:** when not passing the -f parameter. the ssh-keygren tool will generate these files in your ~/.ssh folder directly. This is fine when you only have 1 keypair on your machine, but as you start to get more keypairs some organization is in order.


###Use a pass-phrase on the key

When your private key is compromised and whoever stole the key got access to your server all is lost. Therefor it's very important that your protect your private key and do everything in your power to ensure that it doesn't get lost / stolen

- backup your keys in a secure location
- put a long passphrase on your private key



###Copying the public key to the server

Now that we have generated a keypair, we'll copy the public key to the server. For that we'll use the scp command. As our SSH key authentication hasn't been setup yet, we'll connect to the server using SSH with password authentication.

	scp  ~/.ssh/hetzner_ex4/id_rsa.pub davy@144.16.23.166:~/.ssh/authorized_keys 

Now that we've copied our public key to the server and saved it as the authorized_keys file, we need to setup the correct permissions.

	chmod 700 ~/.ssh
	chmod 600 ~/.ssh/authorized_keys

Also take into account that if you already have an authorized_keys file on your server, you need to append the pubic key.

Keep in mind that the public key can be freely distributed. As long as the corresponding private key is not compromised, your public key alone is not worth a whole lot.

##Setting up an SSH config on the client machine

If you have a lot of keypairs used on different systems, things can get very complex. You'll need to remember a lot of hostnames, ports, users and key locations.

Luckily for us, ssh allows us to define a config that will like a lot easier. The config file is located in the ~/.ssh/ folder and contains a number of **Host** entries.

Each Host entry is made up of 

- a hostname = ip address of the SSH host
- a username = the SSH username
- a port = the SSH port
- IdentityFile = the location of the private key

A sample entry will look like this:


	Host hetzner.ex4
	  HostName 144.16.23.166
	  User davy
	  Port 2347
	  IdentityFile /Users/ddewaele/.ssh/hetzner_ex4/id_rsa


The advantage is that we can now establish an SSH session like this :

	ssh davy@hetzner.ex4  

instead of using this

	ssh davy@hetzner.ex4 -p 2347 -i /Users/ddewaele/.ssh/hetzner_ex4/id_rsa

All we need to remember is the username and a "logical" hostname. (notice how hetzner.ex4 is not an actual resolvable hostname, but simply points to a Host netry in our ~/.ssh/config).

##Conclusion

It doesn't take too much effort to achieve an adequate level of security on your server. Applying a couple of simple rules and guidelines will already take you a long way. Public key authentication combined with a proper SSH config will make it not only easier for you to access the server, but also a lot more difficult for others. 

##References

- [CentOS Guide : Securing SSH](http://wiki.centos.org/HowTos/Network/SecuringSSH)
- [Top 20 OpenSSH Server Best Security Practices](http://www.cyberciti.biz/tips/linux-unix-bsd-openssh-server-best-practices.html)
- [SSH Tips and Tricks](http://lugatgt.org/2009/10/28/ssh-tips-and-tricks-2/)
