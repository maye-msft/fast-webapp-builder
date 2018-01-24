(()=>{
    const model = {
        name: 'user',
        schema: [
            { username: {type: 'string', required: true} },
            { password: {type: 'string', required: true, password:true} },
            { role: [{ type: 'ObjectId', ref: 'role' }] }
        ],
        list: {
            title:'username',
            desc:null
        },
        title:'User',
        callback:{
            before_save:(objs)=>{
               
            }
        },
        auth:{
            save:[],
            list:[],
            update:['user'],
            get:['user'],
            delete:['user']
        }
    }
    
    if (typeof(module)!='undefined'  && module.exports) {
        module.exports = model;
    } else if (window) {
        window.Schema = window.Schema || {};
        window.Schema[model.name] = model
    }
    
})()
