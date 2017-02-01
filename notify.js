var dotenv = require('dotenv').config();
var FEEDSUB = require('feedsub');
var striptags = require('striptags');
var IRC = require('irc');
var request = require('request');
var authUsers = require('./auth_users');

var server    = process.env['SERVER'];
var bot       = process.env['BOTNAME'];
var channels  = [ process.env['CHANNEL1'] ];
var feed      = process.env['FEED'];
var postURL   = process.env['POSTURL'];

var interval  = 1 // Minutes
var latestPostTime = new Date().valueOf();
var rateLimiterTime = 0;

client = new IRC.Client(server, bot, {
  channels: channels,
  realName: 'nodejs IRC bot',
  autoRejoin: true,
  autoConnect: true,
});

reader = new FEEDSUB(feed, {
  interval: interval,
  forceInterval: true,
  autoStart: true,
});

// +-------------------------------------------------+ //
// |                    Get Feed                     | //
// +-------------------------------------------------+ //

reader.on('item', function(item) {

  // -- Check Timestamp, Then Initialize --
  var postTime = new Date(item.pubdate).valueOf();
  if (postTime > latestPostTime) {
    latestPostTime = postTime;
    var poster = item['dc:creator'].match(/^(.+?)\s/)[1];
    var msg = striptags(item.description).replace(/\n/g, ' '); // Clean up

    // -- Truncate --
    if (msg.length > 500) { // Is broke. Fix
      msg = msg.match(/.{0,500}/)[0];
      msg = msg + ' ... [message truncated] ... ';
    } 
    
    // -- Post in IRC Chat --
    console.log(postTime, item.title, poster);
    client.say(channels, 
      '[' + IRC.colors.wrap('magenta', item.title) + '] ' + 
            IRC.colors.wrap('dark_red', poster + ' posted: ') + 
       msg +IRC.colors.wrap('dark_blue', ' [ ' + item.link + ' ]')
    );
    
  }

});

// +-------------------------------------------------+ //
// |                    !commands                    | //
// +-------------------------------------------------+ //

client.addListener('message', function (nick, channel, text) {
  var alertRegex = text.match(/^!(.+?)(?:\s(.+?)\s(.+))?$/);

  // ---------------------------- //
  // !reply <thread ID> <message> //
  // ---------------------------- //
  if (alertRegex && alertRegex.length > 3 && alertRegex[1] === 'reply') {
    
    // -- Rate limiting --
    if (new Date.valueOf() < rateLimiterTime + (60*1000)) {
      client.say(channel, 'Cannot reply. I am still on cooldown. Please try again in 60 seconds.');
    } 

    // -- Is authorized --
    else if (authUsers.hasOwnProperty(nick)) {
      var options = {
        url: postURL,
        qs: {
          api_key: authUsers[nick],
          api_username: nick,
          topic_id: alertRegex[2],
          raw: alertRegex[3]
        }
      }
      request.post(options, function(err, res, body) {
        var bodyObj = JSON.parse(body);
        if (bodyObj.hasOwnProperty("errors") && bodyObj["errors"][0]) {
          client.say(nick, bodyObj["errors"][0]);
        } 
        else {
          client.say(channel, 'Posted ' + nick + '\'s post to thread #' + alertRegex[2]);
          console.log('lat post time', latestPostTime);
          latestPostTime += (120*1000); // Don't read back the new msg
          rateLimiterTime = new Date.valueOf(); // Set cooldown to start now
        }
      })
    }

    // -- Is not authorized --
    else {
      client.say(channel, 'Cannot reply. You do not have an API key on file.')
    }

  }

  // ----- //
  // !help //
  // ----- //
  if (alertRegex && alertRegex.length > 0 && alertRegex[1] === 'help') {
    client.say(nick, 'Currently, I only have one command:');
    client.say(nick, '!reply <Post ID> <Msg>');
    client.say(nick, 'The Post ID can be obtained from the URL. In the following example, 23 is the ID:');
    client.say(nick, '[ http://iiab.io/t/sandbox-testing-thread/23/13 ]');
    client.say(nick, '--------------------------------------------');
    client.say(nick, 'https://github.com/darkenvy/RSS-IRC-NodeBot/');
  }

});


// +-------------------------------------------------+ //
// |                  PM Bot Features                | //
// +-------------------------------------------------+ //
// client.addListener('pm', function (from, message) {
//   console.log('PM from %s => %s', from, message);

//   if (message.match(/die/i)) {
//     console.log(from + ' killed me.');
//     client.part(channels)
//   }
//   if (message.match(/off/i)) {
//       reader.interval = null;
//   }
//   if (message.match(/quiet/i)) {
//       reader.interval = 30;
//   }
//   if (message.match(/noisy/i)) {
//       reader.interval = 1;
//   }
//   if (message.match(/join #+[A-z0-9\-\?.]+$/i)) {
//     var channel = message.match(/#+[A-z0-9\-\?.]+$/).toString();
//     console.log('Joining ' + channel);
//     client.join(channel);
//   }
//   if (message.match(/part #+[A-z0-9\-\?.]+$/i)) {
//     var channel = message.match(/#+[A-z0-9\-\?.]+$/).toString();
//     console.log('Parting ' + channel);
//     client.part(channel);
//   }
// });

client.addListener('error', function(message) {
    console.log('error: ', message);
});