const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 8080, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "tuxedos_cat"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: 'EAACF6ZA7f0UcBAAg06L8SkpnipCEwTE7rfn1AOyzaRLLnEi2lqeVWLCZAtKsTK33EkK6nhqfb28FYqjuizK8JF71evYrQSFPhTZAxtTfGcaJHrL5oPRjJ5WYK3VYht6tIpDkorQZAV8jNoiPoNnxRQSHca5NmmhPcdfsiZB5neAZDZD'},
    //qs: {access_token: EAAKKDZAXFpm8BANZBpVLiFrjgMi6qcaAvR2ww2r4ACpcbq2wvExI3KiwZBP2w5x6FS9Fj5IZAwPWCDFIv7HDoL5gDqC2baROwZA0aiSpRZBXHpljAFNGZACNm0INwJdIqfZCpJUdQqSvRESSOrl7ZAtfxO78aaAopQGK4EUtoecZCv6AZDZD},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {text: text}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

app.get('/', function (req, res) {
  res.send('Hello World!')
})

