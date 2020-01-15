

module.exports = function (model, router, mongoose, auth, swaggerDoc) {
    const Schema = mongoose.Schema;

    const schema = new Schema({}, { timestamps: { createdAt: 'created_at' } });
    for (let i = 0; i < model.schema.length; i++) {
        schema.add(model.schema[i])
    }
    const clz = mongoose.model(model.name, schema);




    function list(req, res) {
        const query = clz.find({});
        query
            .exec()
            .then(objs => {
                res.status(200).json(objs);
            })
            .catch(error => {
                res.status(500).send(error);
                return;
            });
    }
    function save(req, res) {
        var objs = Array.isArray(req.body) ? req.body : [req.body];
        if (model.callback && model.callback["before_save"]) {
            model.callback["before_save"](objs, clz)
        }
        clz.create(objs).
            then(function (objs) {
                if (model.callback && model.callback["after_save"]) {
                    model.callback["after_save"](objs, clz)
                }
                res.status(200).json(objs || []);
                return;
            }).
            catch(error => {
                res.status(500).send(error);
                return;
            });

    }
    function update(req, res) {
        if (model.callback && model.callback["before_update"]) {
            model.callback["before_update"](req.params.id, req.body, clz)
        }
        clz.update({ _id: req.params.id }, req.body, { multi: true }, (err, numAffected) => {
            if (err) {
                res.status(500).send(error);
            }
            else {
                if (model.callback && model.callback["after_update"]) {
                    model.callback["after_update"](req.params.id, req.body, numAffected, clz)
                }
                res.status(200).json({});
            }
            return;
        });
    }
    function get(req, res) {
        const query = clz.findOne({ _id: req.params.id });
        query
            .exec()
            .then(obj => {
                res.status(200).json(obj);
            })
            .catch(error => {
                res.status(500).send(error);
                return;
            });
    }
    function deleteObj(req, res) {
        if (model.callback && model.callback["before_delete"]) {
            model.callback["before_delete"](req.params.id, clz)
        }
        clz.findByIdAndRemove(req.params.id, (err, obj) => {
            if (err)
                res.status(500).send(error);
            else {
                if (model.callback && model.callback["after_delete"]) {
                    model.callback["after_delete"](req.params.id, clz)
                }
                res.status(200).json({});
            }
            return;
        });
    }




    function validate(type, req, res, next) {
        if (!model.auth) {
            next();
            return;
        }
        var permission = model.auth[type];
        if (!permission || permission.length == 0) {
            next();
            return;
        }
        // Get the access-token from the header
        var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

        if (token) {
            try {
                // Decode the previously encoded token using our secret key
                var decoded = auth.decode(token);

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
                var hasRole = false;



                // Validate user
                auth.validateUser(username, function (err, user) {
                    if (user) {
                        for (var i = 0; i < userRole.length; i++) {
                            for (var j = 0; j < permission.length; j++) {
                                if (permission[j] === userRole[i].name) {
                                    hasRole = true;
                                    break;
                                }
                            }
                        }
                        if (hasRole) {
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
                "message": "Bad Request: No Access Token exist, please Sign In"
            });
            return;
        }
    }

    router.put('/' + model.name, (req, res, next) => {
        validate('save', req, res, next)
    }, (req, res) => {
        save(req, res)
    });
    router.get('/' + model.name, (req, res, next) => {
        validate('list', req, res, next)
    }, (req, res) => {
        list(req, res)
    });
    router.post('/' + model.name + "/:id", (req, res, next) => {
        validate('update', req, res, next)
    }, (req, res) => {
        update(req, res)
    });
    router.get('/' + model.name + "/:id", (req, res, next) => {
        validate('get', req, res, next)
    }, (req, res) => {
        get(req, res)
    });
    router.delete('/' + model.name + "/:id", (req, res, next) => {
        validate('delete', req, res, next)
    }, (req, res) => {
        deleteObj(req, res)
    });

    swaggerDoc.paths['/' + model.name] = {
        "get": {
            "tags": [
                model.name + "-controller"
            ],
            "summary": "list_" + model.name,
            "operationId": "list_" + model.name,
            "produces": [
                "*/*"
            ],
            "responses": {
                "200": {
                    "description": "OK",
                    "schema": {
                        "type": "array",
                        "items": {
                            "$ref": "#/definitions/" + model.name
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized"
                },
                "403": {
                    "description": "Forbidden"
                },
                "404": {
                    "description": "Not Found"
                }
            },
            "deprecated": false
        },
        "put": {
            "tags": [
                model.name + "-controller"
            ],
            "summary": "create_" + model.name,
            "operationId": "create_" + model.name,
            "consumes": [
                "application/json"
            ],
            "produces": [
                "*/*"
            ],
            "parameters": [
                {
                    "in": "body",
                    "name": model.name,
                    "description": model.name,
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/" + model.name+"_input"
                    }
                }
            ],
            "responses": {
                "200": {
                    "description": "OK",
                    "schema": {
                        "type": "array",
                        "items": {
                            "$ref": "#/definitions/" + model.name
                        }
                    }
                },
                "201": {
                    "description": "Created"
                },
                "401": {
                    "description": "Unauthorized"
                },
                "403": {
                    "description": "Forbidden"
                },
                "404": {
                    "description": "Not Found"
                }
            },
            "deprecated": false
        },

    }


    swaggerDoc.paths['/' + model.name + '/{id}'] = {
        "get": {
            "tags": [
                model.name + "-controller"
            ],
            "summary": "get_" + model.name,
            "operationId": "get_" + model.name,
            "produces": [
                "*/*"
            ],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "description": "id",
                    "required": true,
                    "type": "string"
                }
            ],
            "responses": {
                "200": {
                    "description": "OK",
                    "schema": {
                        "$ref": "#/definitions/" + model.name,
                    }
                },
                "401": {
                    "description": "Unauthorized"
                },
                "403": {
                    "description": "Forbidden"
                },
                "404": {
                    "description": "Not Found"
                }
            },
            "deprecated": false
        },
        "post": {
            "tags": [
                model.name + "-controller"
            ],
            "summary": "update_" + model.name,
            "operationId": "update_" + model.name,
            "produces": [
                "*/*"
            ],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "description": "id",
                    "required": true,
                    "type": "string"
                },
                {
                    "in": "body",
                    "name": model.name,
                    "description": model.name,
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/" + model.name+"_input"
                    }
                }
            ],
            "responses": {
                "200": {
                    "description": "OK",
                },
                "204": {
                    "description": "No Content"
                },
                "401": {
                    "description": "Unauthorized"
                },
                "403": {
                    "description": "Forbidden"
                }
            },
            "deprecated": false
        },
        "delete": {
            "tags": [
                model.name + "-controller"
            ],
            "summary": "delete_" + model.name,
            "operationId": "delete_" + model.name,
            "produces": [
                "*/*"
            ],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "description": "id",
                    "required": true,
                    "type": "string"
                }
            ],
            "responses": {
                "200": {
                    "description": "OK",
                },
                "204": {
                    "description": "No Content"
                },
                "401": {
                    "description": "Unauthorized"
                },
                "403": {
                    "description": "Forbidden"
                }
            },
            "deprecated": false
        },
        
    };


    require('mongoose-schema-jsonschema')(mongoose);
    let definition = schema.jsonSchema()
    swaggerDoc.definitions[model.name] = definition;
    swaggerDoc.definitions[model.name+"_input"] = JSON.parse(JSON.stringify(definition));
    swaggerDoc.definitions[model.name+"_input"]["properties"]={} 
    Object.keys(definition.properties).forEach((key)=>{
        if(key!='_id' && key!='__v' && key!='created_at' && key!='updatedAt') {
            swaggerDoc.definitions[model.name+"_input"]["properties"][key] = definition.properties[key]
        }
    })
    swaggerDoc.tags.push({
        "name": model.name + "-controller",
        "description": model.name + " controller"
    })
    return clz;
}
