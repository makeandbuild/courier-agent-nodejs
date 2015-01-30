As of 1/30/2015, the pre-packaged node distributions for raspberry pi are not current enough to execute the libraries needed, so compiling from source with the latest code is necessary.

##Installing nodejs on raspberry pi...

Note, the following instructions were performed RPi with the following version:

> pi@mbpi2 ~ $ cat /proc/version

> Linux version 3.12.35+ (dc4@dc4-XPS13-9333) (gcc version 4.8.3 20140303 (prerelease) (crosstool-NG linaro-1.13.1+bzr2650 - Linaro GCC 2014.03) ) #730 PREEMPT Fri Dec 19 18:31:24 GMT 2014

###First, check to see if node is already installed

> pi@mbpi2 ~ $ node -v

> v0.10.35

If node is install and is not at least version 0.10.35 (e.g. it is 0.6.x), then the current version will need to be removed.

> sudo apt-get remove nodes

> sudo apt-get autoremove

###Installing node

####Checkng for packaged version

Check to see if a node version 0.10.35 or higher exists in packaged form for RPi.  First start by checking to see if an appropriate version is available via apt-get.

> pi@mbpi2 ~ $ sudo apt-get update

This will update the list of available packages that can be installed via apt-get.  Then run apt-cache.

> pi@mbpi2 ~ $ sudo apt-cache policy nodejs

> nodejs:

>   Installed: (none)

>   Candidate: 0.6.19~dfsg1-6

>   Version table:

>      0.6.19~dfsg1-6 0

>         500 http://mirrordirector.raspbian.org/raspbian/ wheezy/main armhf Packages  

This will list the next candidate version available for install.  It is likely this will not be a high enough version.  **If the version is high enough**, can then run:

> pi@mbpi2 ~ $ sudo apt-get install nodejs

which will install nodejs and npm and will be done.  No need to to read any further on install instructions.

####Checking for distro version

Otherwise, if the packaged version of node is not recent enough, can then check the published distributions (http://nodejs.org/dist/) for a recent version that contains a RPi distribution, meaning that there is a linux-arm-pi.tar.gz file (e.g. node-v0.11.3-linux-arm-pi.tar.gz).  If one exists, this file can be installed using the following commands (based on http://doctorbin.tumblr.com/post/53991508909/how-to-install-the-latest-version-of-nodejs-npm).

> sudo wget http://nodejs.org/dist/v0.11.3/node-v0.11.3-linux-arm-pi.tar.gz

> tar xvzf node-v0.11.3-linux-arm-pi.tar.gz

> sudo cp -r node-v0.11.3-linux-arm-pi/* /opt/node

> sudo ln -s /opt/node/bin/node /usr/local/bin/node

> sudo ln -s /opt/node/bin/npm /usr/local/bin/npm

####Installing from source

If a recent version of node is not installed and there are no recent packaged distros that can be found, it will need to be installed from source (based on http://elinux.org/Node.js_on_RPi).

Go to http://nodejs.org/dist/ find the appropriate version to get the source for and run following commands.

> wget http://nodejs.org/dist/v0.10.35/node-v0.10.35.tar.gz
 
> tar -xzf node-v0.10.35.tar.gz 

> cd node-v0.10.35

> ./configure

> make

> sudo make install  

Note, be aware that the configure, make and make install commands can take several hours to run to completion.  It is recommended to use screen to allow these commands to run in the background in case the terminal is disconnected.


