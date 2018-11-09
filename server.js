'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const config = require('./config');
const FBeamer = require('./fbeamer');
const PORT = process.env.PORT || 3000;
const f = new FBeamer(config.fb);

// Vanilla
const matcher = require('./matcher');
const weather = require('./weather');
const { currentWeather, forecastWeather } = require('./parser');

app.get('/', (req, res) => f.registerHook(req, res));
app.post('/', bodyParser.json({
  verify: f.verifySignature
}))

app.post('/', (req, res, next) => {
  // Messages will be received if the signature goes through
  // We will pass the messages to FBeamer for parsing
  return f.incoming(req, res, async data => {
    if (data.type === 'text') {
      matcher(data.content, async resp => {
        switch(resp.intent) {
          case 'Hello':
            await f.txt(data.sender, `${resp.entities.greeting} to you too!`);
            break;
          case 'CurrentWeather':
            await f.txt(data.sender, 'Let me check...');
            const cwData = await weather(resp.entities.city, 'current');
            const cwResult = currentWeather(cwData);
            await f.txt(data.sender, cwResult);
            break;
          case 'WeatherForecast':
            await f.txt(data.sender, 'Let me check...');
            const wfData = await weather(resp.entities.city);
            const wfResult = forecastWeather(wfData, resp.entities);
            await f.txt(data.sender, wfResult);
            break;
          case 'Exit':
            await f.txt(data.sender, 'Have a nice day :)');
            break;
          case 'Help':
            await f.txt(data.sender, 'You can ask me about the weather in a location, e.g. What is the weather like in new york?\nYou can also ask me about the weather tomorrow, e.g. Is it sunny in new york tomorrow?');
            break;
          default:
            await f.txt(data.sender, 'I don\'t know what you mean :(');
        }
      })
    }
  });
})

app.listen(PORT, () => {
  console.log('FBeamer Bot service running on port ' + PORT);
})