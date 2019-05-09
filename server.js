var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5

const accountSid = '-';
const authToken = '-';
const client = require('twilio')(accountSid, authToken);

const axios = require('axios');

app.use(bodyParser.urlencoded());


var solutionTitle = null;
var solutionArray = [];
var solutionMedia = null;

app.post('/', function (req, res) {
    var received = req.body.Body;
    var response = "";

    console.log("Received this whatsapp message: " + received);

    received = ('' + received).toLowerCase();

    if (received == 'play') {
        axios.get('https://en.wikipedia.org/api/rest_v1/page/random/title').then(wikiResponse => {
            console.log("Received from wiki: " + JSON.stringify(wikiResponse.data));            
            solutionTitle = '' + wikiResponse.data.items[0].title;
            solutionArray = solutionTitle.toLowerCase().split('_');

            console.log("Solution: " + solutionTitle);

            axios.get('https://en.wikipedia.org/api/rest_v1/page/media/' + solutionTitle).then(wikiResponse => {
                solutionMedia =  wikiResponse.data.items[0].original.source;

                client.messages.create({
                    from: req.body.To,
                    body: response,
                    to: req.body.From,
                    mediaUrl: solutionMedia
                }).then(message => {
                    console.log("Message sended with id: " + message.sid);
                    res.send('OK');
                });
            }).catch(error => {
                console.log(error);
            });

        }).catch(error => {
            console.log(error);
        });
        
    } else {
        if (solutionArray == null || solutionArray.length == 0) {
            response = 'Please start the game sending the word "play"';
        } else {
            if (solutionArray.indexOf(received) >= 0) {
                response = "You dit it!! The page title is " + solutionTitle;
            } else {
                response = 'Nah nah';
            }
            
        }

        client.messages.create({
            from: req.body.To,
            body: response,
            to: req.body.From
        }).then(message => {
            console.log("Message sended with id: " + message.sid);
            res.send('OK');
        });
    }

});

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
});
