var dotenv = require('dotenv').config();
var FEEDSUB = require('feedsub');
var striptags = require('striptags');
var IRC = require('irc');

var server    = process.env['SERVER'];
var bot       = process.env['BOTNAME'];
var channels  = [ process.env['CHANNEL1'] ];
var feed      = process.env['FEED'];
var interval  = 1 // Minutes

client = new IRC.Client(server, bot, {
  channels: channels,
  realName: 'nodejs IRC bot',
  autoRejoin: true,
  autoConnect: true,
});

// reader = new FEEDSUB(feed, {
//   interval: interval,
//   forceInterval: true,
//   autoStart: true,
// });

// -------------------- Get Feed --------------------  //
console.log('vars', server, bot, channels, feed);
var latestPostTime = new Date().valueOf();

// reader.on('item', function(item) {
//   var postTime = new Date(item.pubdate).valueOf();
//   if (postTime > latestPostTime) {
//     latestPostTime = postTime;

//     var poster = item['dc:creator'].match(/^(.+?)\s/)[1];
//     var msg = striptags(item.description).replace(/\n/g, ' '); // Clean up
//     if (msg.length > 300) msg = msg.match(/.{0,300}/)[0]; // truncate
    
//     client.say(channels, 
//       '[' + IRC.colors.wrap('magenta', item.title) + '] ' + 
//             IRC.colors.wrap('dark_red', poster + ' posted: ') + 
//        msg +IRC.colors.wrap('dark_blue', ' [ ' + item.link + ' ]')
//     );
    
//     console.log(postTime, item.title, poster);
//     // console.log(
//     //   '[' + item.title + '] ' + 
//     //   poster + ' posted: ' + 
//     //   msg + ' [ ' + item.link + ' ]'
//     // );

//   }

// });

// -------------------- Reply to Post --------------------  //

client.addListener('message', function (nick, channel, text) {

  if (text.match(/^!reply/)[0]) {
    console.log(nick, channel, text);
  }

  if (text.match(bot + ' help')) {
    client.say(channel, 'RTFM, ' + nick + ': https://github.com/darkenvy/RSS-IRC-NodeBot/');
  }
});



// -------------------- PM Bot Features ----------------------- //

client.addListener('error', function(message) {
    console.log('error: ', message);
});

// Send the bot private messages to command it.

client.addListener('pm', function (from, message) {
  console.log('PM from %s => %s', from, message);

  if (message.match(/die/i)) {
    console.log(from + ' killed me.');
    client.part(channels)
  }
  if (message.match(/off/i)) {
      reader.interval = null;
  }
  if (message.match(/quiet/i)) {
      reader.interval = 30;
  }
  if (message.match(/noisy/i)) {
      reader.interval = 1;
  }
  if (message.match(/join #+[A-z0-9\-\?.]+$/i)) {
    var channel = message.match(/#+[A-z0-9\-\?.]+$/).toString();
    console.log('Joining ' + channel);
    client.join(channel);
  }
  if (message.match(/part #+[A-z0-9\-\?.]+$/i)) {
    var channel = message.match(/#+[A-z0-9\-\?.]+$/).toString();
    console.log('Parting ' + channel);
    client.part(channel);
  }
});

