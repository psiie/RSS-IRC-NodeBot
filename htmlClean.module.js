var cheerio = require('cheerio');
var IRC = require('irc');

module.exports = {
  get: function(html){
    
    // Cheap way of checking for <![CDATA[ ... ]]>
    if (html[1] == '!') {
        html = html.slice(10, html.length-4); // cuts off <![CDATA[ ]]>
        html = html.replace(/<br>/g, ' ');
    }
    var $ = cheerio.load(html);

    // Clean up Uglies
    $('code').replaceWith( IRC.colors.wrap('gray', ' [CodeBlock] ') ) // colorize
    $('blockquote').replaceWith( IRC.colors.wrap('gray', ' [Quote] ') ) // colorize
    $('img').replaceWith( IRC.colors.wrap('gray', ' [Image] ') ) // colorize
    $('a').replaceWith( IRC.colors.wrap('gray', ' [Link] ') ) // colorize

    // Beautify List
    var each = $('li')
    for (var i=0; i<each.length; i++) {
      var text = $(each[i]).text();
      $(each[i]).text( IRC.colors.wrap('orange', i+1 + ': ' + text) ) // colorize
    }

    // Final Cleanup. Rid newlines, replace with alternating colors
    // Fix multiple whitespaces
    var cleanedText = $.text();
    // cleanedText = cleanedText.replace(/(\n\s{0,})+/g, function(m){return alternateColor()}); 
    cleanedText = cleanedText.replace(/(\n\s{0,})+/g, ' '); 
    cleanedText = cleanedText.replace(/\s{2,}/g, ' ')

    return cleanedText;
  }
}