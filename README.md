#RSS IRC NodeBot
---

###How to Use
`npm install` to install the depends.

Create a file called `.env` and input your variables for the bot. The .env file contains the configuration. An example file called `.env.sample` is provided. Otherwise, the 4 key/value pairs are as follows:

	SERVER="chat.freenode.net"
	BOTNAME="NodeJS-Bot"
	CHANNEL1="#botwars"
	FEED="http://lorem-rss.herokuapp.com/feed?unit=second&interval=30"
	
The default interval is set to 1 minute. If this is too frequent, this can be changed inside notify.js near line 10.	

`node notify.js` to run the bot

###ToDo
* Create new threads
* List all possible threads to reply to
* Add cooldown to everything. IRC is easy to spam.
* Fix long messages being cut off