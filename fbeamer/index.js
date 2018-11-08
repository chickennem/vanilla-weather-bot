'use strict';

const crypto = require('crypto');
const axios = require('axios');
const apiVersion = 'v3.2';

class FBeamer {
  constructor({ pageAccessToken, verifyToken, appSecret }) {
    try {
      if (pageAccessToken && verifyToken) {
        this.pageAccessToken = pageAccessToken;
        this.verifyToken = verifyToken;
        this.appSecret = appSecret;
      } else {
        throw new Error('One or more tokens/credentials are missing!');
      }
    } catch (e) {
      console.log(e);
    }
  }

  registerHook(req, res) {
    const params = req.query;
    console.log(params);
    const mode = params['hub.mode'];
    const token = params['hub.verify_token'];
    const challenge = params['hub.challenge'];

    // if mode === 'subscribe' and token === verifyToken, then send back challenge
    try {
      if (mode && token && mode === 'subscribe' && token === this.verifyToken) {
        console.log('Webhook registered!');
        return res.status(200).send(challenge);
      } else {
        throw new Error('Could not register webhook!');
        return res.sendStatus(200);
      }
    } catch(e) {
      console.log(e);
    }
  }

  verifySignature(req, res, buf) {
    return (req, res, buf) => {
      if (req.method === 'POST') {
        try {
          const signature = req.headers['x-hub-signature'];
          if (!signature) {
            throw new Error('Signature not received!');
          } else {
            const hash = crypto.createHmac('sha1', this.appSecret).update(buf, 'utf-8');
            // signature is in the form: sha1=<some_hash>
            if (hash.digest('hex') !== signature.split('=')[1]) {
              throw new Error('Invalid signature!');
            }
          }
        } catch(e) {
          console.log(e);
        }
      }
    }
  }

  incoming(req, res, cb) {
    res.sendStatus(200);
    if (req.body.object === 'page' && req.body.entry) {
      const data = req.body;

      data.entry.forEach(pageObj => {
        if (pageObj.messaging) {
          pageObj.messaging.forEach(messageObj => {
            if (messageObj.postback) {
              // Handle postback
            } else {
              // Handle messages
              return cb(this.messageHandler(messageObj));
            }
          })
        }
      })
    }
  }

  // Filter messageObj to get only the fields we need
  messageHandler(obj) {
    const sender = obj.sender.id;
    const message = obj.message;
    let result = {};

    if (message.text) {
      result = {
        sender,
        type: 'text',
        content: message.text
      }
      return result;
    }
  }

  sendMessage(payload) {
    return axios.post(
      `https://graph.facebook.com/${apiVersion}/me/messages?access_token=${this.pageAccessToken}`,
      payload
    )
    .then(res => {
      console.log(res.data);
      return {
        rid: res.data.recipient_id,
        mid: res.data.message_id
      }
    })
    .catch(err => console.log(err));
  }

  /* Functions to send response back to user */

  // Send a text response
  txt(id, text, messaging_type = 'RESPONSE') {
    const obj = {
      messaging_type,
      recipient: { id },
      message: { text }
    }
    return this.sendMessage(obj);
  }

  // Send an image response
  img(id, url, messaging_type = 'RESPONSE') {
    const obj = {
      messaging_type,
      recipient: { id },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url
          }
        }
      }
    }
    return this.sendMessage(obj);
  }
}

module.exports = FBeamer;