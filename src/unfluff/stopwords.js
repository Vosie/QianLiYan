// Generated by CoffeeScript 2.0.0-beta7
void function () {
  var tokens = require('./data/stopwords.json');
  var _ = require('lodash');
  var removePunctuation = function (content) {
    return content.replace(/[\|\@\<\>\[\]\"\'\.,-\/#\?!$%\^&\*\+;:{}=\-_`~()]/g, '');
  };
  var candiateWords = function (strippedInput) {
    return strippedInput.split(' ');
  };

  module.exports = function (content, language) {
    if (null == language)
      language = 'en';

    var stopWords = tokens[language];
    var strippedInput = removePunctuation(content);
    var words = candiateWords(strippedInput);
    var overlappingStopwords = [];
    var count = 0;

    if (language === 'zh' || language === 'ko') {
      _.each(words, function (w) {
        _.each(w, function(c) {
          count += 1;
          if (stopWords.indexOf(c) > -1)
            return overlappingStopwords.push(c);
        });
      });
    } else {
      _.each(words, function (w) {
        count += 1;
        if (stopWords.indexOf(w) > -1)
          return overlappingStopwords.push(w);
      });
    }

    return {
      wordCount: count,
      stopwordCount: overlappingStopwords.length,
      stopWords: overlappingStopwords
    };
  };
}.call(this);
