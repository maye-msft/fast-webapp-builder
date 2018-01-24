const jwt         = require('jwt-simple');
const bcrypt      = require('bcrypt');

// const config      = require('../server/config');


/**
 * Routers for authentication: /login, /register, /password
 * @type {{login: auth.login, register: auth.register, validateUser: auth.validateUser}}
 */

const auth = function(config, User) {
    
    // const usermodel = require('./user.model.js')
    // const Schema = mongoose.Schema;
    // const userschema = new Schema({}, { timestamps: { createdAt: 'created_at' } } );
    // for (let i = 0; i < usermodel.schema.length; i++) {
    //     userschema.add(usermodel.schema[i])
    // }
    // const User = mongoose.model(usermodel.name, userschema);

    /**
     * This method generates JWT string using username
     * @param user
     * @returns {{token: String, expires, username: *, role: (*|UserSchema.role|{type, required}|string|string|string)}}
     */
    function generateToken(user) {
        var expires = expiresIn(config.dayForTokenExpiration); // 7 days

        // TODO: This is encoded but not encrypted, Encrypt it!
        var token = jwt.encode({
            exp: expires,
            username: user.username,
            userId: user._id,
            role: user.role
        }, config.secret);

        // return token, expiration date, username and role
        return {
            token: token,
            expires: expires,
            username: user.username,
            role: user.role
        };
    }

    /**
     * Adds numDates to current data&time
     * @param numDays
     * @returns {Date}
     */
    function expiresIn(numDays) {
        var dateObj = new Date();
        // Add date
        dateObj = dateObj.setDate(dateObj.getDate() + numDays);

        return dateObj;
    }

    return {
        /**
         * /login endpoint
         * @param req request having http body should have username and password
         * @param res response having token data including username and role
         */
        login: function(req, res) {
            var username = req.body.username || '';
            var password = req.body.password || '';

            // If user or password, credentials error
            if (username == '' || password == '') {
                res.status(401);
                res.json({
                    "status": 401,
                    "message": "Unauthorized: Invalid credentials"
                });
                return;
            }

            // Find the user
            User.findOne({username: username})
                //.select('+password')// select all fields but additionaly password, because its select = false in the model
                .populate('role', 'name')
                .exec(function (err, user) {

                    // If error exists or user could't be found
                    if (err || !user) {
                        res.status(401);
                        res.json({
                            "status": 401,
                            "message": "Unauthorized: Invalid credentials"
                        });
                        return;
                    }

                    // Decrypt and compare the user password
                    bcrypt.compare(password, user.password, function (err, valid) {
                        if (err || !valid) {
                            res.status(401);
                            res.json({
                                "status": 401,
                                "message": "Unauthorized: Invalid credentials"
                            });
                            return;
                        }

                        // Generate token using JWT
                        var tokenData = generateToken(user);

                        // Send OK
                        res.status(200).send(tokenData);
                    });
                });
        },

        /**
         * /register endpoint
         * @param req request having all information for either store or driver
         * @param res response having only http status code (201: User Created, 409: User Already Exist)
         */
        register: function(req, res){
            var username =  req.body.username   || '';
            var password =  req.body.password   || '';
            var role =      req.body.role       || [];
            

            // If user or password, credentials error
            if (username == '' || password == '') {
                res.status(401);
                res.json({
                    "status": 401,
                    "message": "Unauthorized: Invalid credentials"
                });
                return;
            }

            // Find the user
            User.findOne({username: username})
                .select('username')
                .exec(function (err, user) {

                    // If user does not exist, create user
                    if(!user){
                        // Create the user
                        var user = new User();
                        user.username = username;
                        user.role = role;
                        // Hash the password
                        bcrypt.hash(password, 10, function (err, hash) {
                            user.password = hash;

                            // Save the user
                            user.save(function(err,user) {

                                if (err) {
                                    // Send: Bad Request
                                    res.status(500).json({
                                        "status": 500,
                                        "message": "Internal Error: User can not be registered"
                                    });
                                    return;
                                }

                                // If everything is OK, send 201
                                res.status(201).json({
                                    "status": 201,
                                    "message": "Created: User is successfully registered"
                                });
                                return;
                            });
                        });

                    } else {
                        res.status(409).json({
                            "status": 409,
                            "message": "Conflict: User already exist"
                        });
                        return;
                    }
                });
        },

        

        /**
         * This is an async method to find the user from database
         * @param username email of the user
         * @param callback The callback passing the result of db query
         */
        validateUser: function(username, callback) {
            process.nextTick(function() {
                User.findOne({username: username})
                // .populate('role')
                    .exec(function (err, user) {
                        callback(err, user);
                    });
            });
        },

        decode:function(token) {
            return jwt.decode(token, config.secret);
        }
    }
};


module.exports = auth;