var dotenv = require('dotenv').config();
var FEEDSUB = require('feedsub');
var striptags = require('striptags');
var IRC = require('irc');


// Set up your little spambot
var server    = process.env['SERVER'];
var bot       = process.env['BOTNAME'];
var channels  = [ process.env['CHANNEL1'] ];
var feed      = process.env['FEED'];
var interval  = 1 // In Minutes

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

// -------------------- Primary Logic --------------------  //

var latestPostTime = new Date().valueOf() - 2400000;

// console.log(IRC.colors.wrap('magenta', 'big text'), 'next item');

reader.on('item', function(item) {
  var postTime = new Date(item.pubdate).valueOf();
  if (postTime > latestPostTime) {
    latestPostTime = postTime;

    var poster = item['dc:creator'].match(/^(.+?)\s/)[1];
    var msg = striptags(item.description).replace(/\n/g, ' '); // Clean up
    if (msg.length > 300) msg = msg.match(/.{0,300}/)[0]; // truncate
    
    // console.log(postTime, item.title, poster);
    // console.log(
    //   '[' + item.title + '] ' + 
    //   poster + ' posted: ' + 
    //   msg + ' [ ' + item.link + ' ]'
    // );
    
    client.say(channels, 
      '[' + IRC.colors.wrap('magenta', item.title) + '] ' + 
            IRC.colors.wrap('dark_red', poster + ' posted: ') + 
       msg +IRC.colors.wrap('dark_blue', ' [ ' + item.link + ' ]')
    );

  }

});


// -------------------- PM Bot Features ----------------------- //

client.addListener('message', function (nick, to, text) {
  if (text.match(bot + ' help')) {
    client.say(to, 'RTFM, ' + nick + ': https://github.com/');
  }
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

