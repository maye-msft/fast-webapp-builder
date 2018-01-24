var jwt     = require('jwt-simple');
var auth    = require('auth.js');
var config  = require('../../config');

/**
 * This module is a safe-guard for validating each request
 * @param req
 * @param res
 * @param next
 */
module.exports = function(req, res, next) {

    // Get the access-token from the header
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

    if (token) {
        try {
            // Decode the previously encoded token using our secret key
            var decoded = jwt.decode(token, config.secret);

            // Check whether it is expired or not
            if (decoded.exp <= Date.now()) {
                res.status(401);
                res.json({
                    "status": 401,
                    "message": "Unauthorized: Token expired"
                });
                return;
            }

            // Authorize the user to see if s/he can access our resources
            var username = decoded.username;
            var userRole = decoded.role;

            // Validate user
            auth.validateUser(username, function(err, user){
                if(user) {
                    if ((req.url.indexOf('admin') >= 0 && userRole == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/v1/') >= 0)) {
                        // Pass user_id to subsequent calls
                        req.user_id = user._id;
                        // move to next middleware
                        next();

                    } else {
                        res.status(403);
                        res.json({
                            "status": 403,
                            "message": "Forbidden: Not Authorized"
                        });
                        return;
                    }

                } else {
                    // No user with this username exists
                    res.status(401);
                    res.json({
                        "status": 401,
                        "message": "Unauthorized: The user doen't exist"
                    });
                    return;
                }
            });

        } catch (err) {
            res.status(403);
            res.json({
                "status": 403,
                "message": "Forbidden: Not Authorized"
            });
            return;
        }

    } else {
        res.status(400);
        res.json({
            "status": 400,
            "message": "Bad Request: No Access Token exist"
        });
        return;
    }
};