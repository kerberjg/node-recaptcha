/*!
 * node-google-recaptcha
 * (c) 2016 Jakub Kerber (https://github.com/kerberjg)
 * Based on Pete Mardell's recaptcha-v2 (https://www.npmjs.com/package/recaptcha-v2) (https://www.npmjs.com/~mrpetem)
 *          and Michael Hampton's node-recaptcha (https://www.npmjs.com/package/recaptcha) (https://www.npmjs.com/~mirhampt)
 * MIT Licensed
 */

/*
 *  Dependencies
 */

var https = require('https'),
    querystring = require('querystring');

/*
 *  Constants
 */

var API_HOST      = 'www.google.com',
    API_END_POINT = '/recaptcha/api/siteverify';

/**
 * Initialize Recaptcha with given `public_key`, `private_key` and optionally
 * `data`.
 *
 * The `data` argument should have the following keys and values:
 *
 *   remoteip:  Optional. The user's IP address.
 *   response: Required. The user response token provided by the reCAPTCHA to the user and provided to your site on.
 *   secret:  Required. The shared key between your site and reCAPTCHA.
 *
 * @param {String} site_key Use this in the HTML code your site serves to users.
 * @param {String} secret_key Use this for communication between your site and Google.
 *
 * @api public
 */

var ReCaptcha = function(site_key, secret_key) {
    this.site_key = site_key;
    this.secret_key = secret_key;

    return this;
}

/**
 * Verify the reCAPTCHA response.
 *
 * Example usage:
 *
 *     var recaptcha = new Recaptcha('PUBLIC_KEY', 'PRIVATE_KEY', data);
 *     recaptcha.verify(function(success, error_code) {
 *         if (success) {
 *             // data was valid.  Continue onward.
 *         }
 *         else {
 *             // data was invalid, redisplay the form using
 *             // recaptcha.toHTML().
 *         }
 *     });
 *
 * @param {Function} callback
 * @api public
 */

ReCaptcha.prototype.verify = function(code, callback) {
    var err = '';
    var data = {
        'response': code,
        'secret': this.secret_key
    }

    // Request validation
    if(!('response' in data && 'secret' in data))
    {
        err = 'invalid-input-response';
        return callback(err);
    }
    if(data.response === '') {
        err = 'missing-input-response';
        return callback(err);
    }
	if(data.secret === '') {
        err = 'missing-input-secret';
        return callback(err);
    }
	
    var data_qs = querystring.stringify(data);

    var req_options = {
        host: API_HOST,
        path: API_END_POINT,
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data_qs.length
        }
    };

    var request = https.request(req_options, function(response) {
        var body = '';

        response.on('error', function(err) {
            request.end();
            callback(err);
        });

        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            try {
                body = JSON.parse(body);
                callback(body['error-codes'], body['success']);
            }
            catch(e) {
                callback(e);
            }
        });
    });
    request.write(data_qs, 'utf8');
    request.end();
};

module.exports = ReCaptcha;