# node-recaptcha
[![npm version](https://badge.fury.io/js/node-recaptcha-v2.svg)](https://badge.fury.io/js/node-recaptcha-v2)
[![npm](https://img.shields.io/npm/dm/node-recaptcha-v2.svg)]()
[![npm](https://img.shields.io/npm/dt/node-recaptcha-v2.svg)]()

Simplistic Node.js bindings for Google's reCAPTCHA (**v2 supported**)

## Installation

Via npm:

    $ npm install recaptcha

## Setup

Before you can use this module, you must visit http://www.google.com/recaptcha
to request a public and private API key for your domain.

## Frontend implementation

See these [instructions](https://developers.google.com/recaptcha/old/docs/customization)
for help customizing the look of Recaptcha.  In brief, you will need to add a
structure like the following before the form in your document:

    <script type="text/javascript">
        var RecaptchaOptions = {
           theme : 'clean',
           lang  : 'en'
        };
    </script>

## Example Using [Express](http://www.expressjs.com)

    var express  = require('express'),
        recaptcha = require('recaptcha');

    var PUBLIC_KEY  = 'YOUR_PUBLIC_KEY',
        PRIVATE_KEY = 'YOUR_PRIVATE_KEY';

    var app = express.createServer();

    app.configure(function() {
        app.use(express.bodyParser());
    });

    app.get('/', function(req, res) {
        var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY);

        res.render('form.jade', {
            layout: false,
            locals: {
                recaptcha_form: recaptcha.toHTML()
            }
        });
    });

    app.post('/', function(req, res) {
        var data = {
            remoteip:  req.connection.remoteAddress,
            challenge: req.body.recaptcha_challenge_field,
            response:  req.body.recaptcha_response_field
        };
        var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);

        recaptcha.verify(function(success, error_code) {
            if (success) {
                res.send('Recaptcha response valid.');
            }
            else {
                // Redisplay the form.
                res.render('form.jade', {
                    layout: false,
                    locals: {
                        recaptcha_form: recaptcha.toHTML()
                    }
                });
            }
        });
    });

    app.listen(3000);

views/form.jade:

    form(method='POST', action='.')
      != recaptcha_form

      input(type='submit', value='Check Recaptcha')

Make sure [express](http://www.expressjs.com) and [jade](http://jade-lang.com)
are installed, then:

    $ node app.js
