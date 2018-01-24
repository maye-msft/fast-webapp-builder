(()=>{
    const model = {
        name: 'role',
        schema: [
            { name: {type: 'string', required: true} },
            { desc: {type: 'string', } },
        ],
        list: {
            title:'usrname',
            desc:'desc'
        },
        title:'Role',
        callback:{
           
        },
        auth:{
            save:[],
            list:['user'],
            update:[],
            get:['user'],
            delete:[]
        }
    }
    
    if (typeof(module)!='undefined'  && module.exports) {
        module.exports = model;
    } else if (window) {
        window.Schema = window.Schema || {};
        window.Schema[model.name] = model
    }
    

})()
