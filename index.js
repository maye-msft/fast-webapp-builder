function server(config, cb) {
    const express = require('express')
    var mongoose = require('mongoose');
    mongoose.connect(config.databaseURI, { useMongoClient: true });
    mongoose.Promise = global.Promise;

    const model2api = require('./model2api.js')
    const app = express()
    const router = express.Router()
    var bodyParser = require('body-parser')
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use('/public', express.static(__dirname +'/web'))
    app.use('/node_modules', express.static('./node_modules'))

    let auth = null;

    if(config.auth) {
        const authfunc = require("./auth/auth.js")
        const usermodel = require("./auth/user.model.js")
        const rolemodel = require("./auth/role.model.js")
        const User = model2api(usermodel, router, mongoose, auth)
        const Role = model2api(rolemodel, router, mongoose, auth)

        auth = authfunc({secret:config.secret, dayForTokenExpiration:config.dayForTokenExpiration}, User)
        if(config.role && config.role.length>0) {

            function roles2api(objs) {
                const roles = [];
                for(let obj of objs) {
                    roles.push({value:obj._id,text:obj.name})
                }
                app.get('/role', (req, res)=>{
                    res.status(200).json(roles);
                });
                return;
            }
            Role.find({})
                .exec()
                .then(objs => {
                    if(!objs || objs.length==0) {
                        Role.create(config.role).
                        then(function (objs) {
                            console.log("create role successfully!")
                            roles2api(objs)
                            return;
                        }).
                        catch(error => {
                            console.log(error)
                            return;
                        });
                    } else {
                        console.log("load role successfully!")
                        roles2api(objs)
                        return
                    }
                })
                .catch(error => {
                    console.log(error)
                    return;
                });
        }


        
        app.post('/login', auth.login);
        app.post('/register', auth.register);
    }

    
    const models = [];
    const dbhelper = {};
    for(let modelpath of config.models) {
        const model = require(modelpath)
        dbhelper[model.name] = model2api(model, router, mongoose, auth)
        models.push(model);
    }

    app.get('/modelmeta', function(req, res) {
        const code = `
            const models = ${JSON.stringify(models, null, 4)};
            const auth = ${config.auth};
        `;
        res.status(200).send(code);
    });

    app.use('/api', router);

    function next() {
        app.listen(config.port || 3000, () => console.log('app listening on port 3000!'))
    }
    if(cb)
        cb(models, dbhelper, next);
    else
        next()    
    
}
module.exports = server