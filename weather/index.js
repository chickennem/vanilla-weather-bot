'use strict';

const YQL = require('yql');

// Can get either current weather condition or weather forecast
const getWeather = (location, type = 'forecast') => {
  return new Promise((resolve, reject) => {
    const query = new YQL(`select ${type === 'current' ? 'item.condition, location' : '*'} from weather.forecast where woeid in (select woeid from geo.places(1) where text = '${location}') and u='c'`);

    query.exec((err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    })
  })
}

module.exports = getWeather;