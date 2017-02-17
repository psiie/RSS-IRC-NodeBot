var cheerio = require('cheerio');
var IRC = require('irc');

module.exports = {
  get: function(html){
    // An object that alternates what it returns
    // probably can make shorter using a list[].
    var alternateColor = new function() {
      var current = 0;
      var cycle = function() {
        current++;
        current = current % 2;
        return current;
      }
      var get = function() {
        if (cycle()) {return '\u000302';} // dark blue
        else         {return '\u000301';} // black
      }
      return get;
    }

    html = html.slice(10, html.length-4); // cuts off <![CDATA[ ]]>
    html = html.replace(/<br>/g, ' ');
    var $ = cheerio.load(html);

    // Clean up Uglies
    $('code').replaceWith( IRC.colors.wrap('light_gray', '[CodeBlock]') ) // colorize
    $('blockquote').replaceWith( IRC.colors.wrap('light_gray', '[Quote]') ) // colorize
    $('img').replaceWith( IRC.colors.wrap('light_gray', '[Image]') ) // colorize
    $('a').replaceWith( IRC.colors.wrap('light_gray', '[Link]') ) // colorize

    // Beautify List
    var each = $('li')
    for (var i=0; i<each.length; i++) {
      var text = $(each[i]).text();
      $(each[i]).text( IRC.colors.wrap('orange', i+1 + ': ' + text) ) // colorize
    }

    // Final Cleanup. Rid newlines, replace with alternating colors
    // Fix multiple whitespaces
    var cleanedText = $.text();
    cleanedText = cleanedText.replace(/(\n\s{0,})+/g, function(m){return alternateColor()}); 
    cleanedText = cleanedText.replace(/\s{2,}/g, ' ')

    return cleanedText;
  }
}