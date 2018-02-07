const server = require("../")
const path = require("path")
server({
    'databaseURI':'mongodb://localhost:27017/test',
    'port':3001,
    'secret': 'thisIsTopSecret',
    'dayForTokenExpiration' : 7,
    'auth':true,
    'role':[{name:'admin', desc:'admin'},{name:'user', desc:'user'}],
    'models':[
        path.join(__dirname, 'a.model.js'),
        path.join(__dirname, 'b.model.js'),
        path.join(__dirname, 'c.model.js'),
        path.join(__dirname, 'd.model.js'),
        path.join(__dirname, 'e.model.js')

    ]
})