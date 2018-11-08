'use strict';

const patterns = require('../patterns');
const xRegExp = require('xregexp');

const createEntities = (str, pattern) => {
  return xRegExp.exec(str, xRegExp(pattern, 'i'));
}

const matchPattern = (str, cb) => {
  const getResult = patterns.find(item => {
    return (xRegExp.test(str, xRegExp(item.pattern, 'i')));
  });

  if (getResult) {
    return cb({
      intent: getResult.intent,
      entities: createEntities(str, getResult.pattern)
    })
  } else {
    return cb({});
  }
}

module.exports = matchPattern;