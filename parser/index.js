'use strict';

// const colors = require('colors');
const moment = require('moment');

const dictionary = require('./dictionary');

const getFeel = temp => {
  if (temp < 5) {
    return 'shivering cold';
  } else if (temp < 15) {
    return 'pretty cold';
  } else if (temp < 25) {
    return 'moderately cold';
  } else if (temp < 32) {
    return 'quite warm';
  } else if (temp < 40) {
    return 'very hot';
  } else {
    return 'super hot';
  }
}

const getPrefix = (conditionCode, tense = 'present') => {
  const findPrefix = dictionary[tense].find(item => {
    return item.codes.indexOf(Number(conditionCode)) > -1;
  })
  return findPrefix.prefix || '';
}

const currentWeather = response => {
  const { results } = response.query;
  if (results) {
    const { channel } = results;

    const location = `${channel.location.city}, ${channel.location.country}`;
    const { text, temp, code } = channel.item.condition;
    return `Right now, ${getPrefix(code)} ${text.toLowerCase()} in ${location}. It is ${getFeel(Number(temp))} at ${temp} degrees Celsius`;
  } else {
    return 'I don\'t seem to know anything about this place... Sorry :(';
  }
}

const getDate = day => {
  const dayStr = day.toLowerCase().trim();
  switch(dayStr) {
    case 'tomorrow':
      return moment().add(1, 'd').format('DD MMM YYYY');
    case 'day after tomorrow':
      return moment().add(2, 'd').format('DD MMM YYYY');
    default:
      return moment().format('DD MMM YYYY');
  }
}

const forecastWeather = (response, data) => {
  const { results } = response.query;
  if (results) {
    const parseDate = getDate(data.time);

    const { channel } = results;
    const location = `${channel.location.city}, ${channel.location.country}`;
    const getForecast = channel.item.forecast.filter(item => item.date === parseDate)[0];

    const regex = new RegExp(data.weather, 'i');
    const testConditions = regex.test(getForecast.text);

    return `${testConditions ? 'Yes' : 'No'}, ${getPrefix(getForecast.code, 'future')} ${getForecast.text} ${data.time} in ${location}`;
  } else {
    return 'I don\'t seem to know anything about this place... Sorry :(';
  }
}

module.exports = {
  currentWeather,
  forecastWeather
};