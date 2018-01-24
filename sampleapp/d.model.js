(()=>{



    const model = {
        name: 'entD',
        schema: [
            { title: {type: 'string', required: true} },
            { value: {type: 'number', required: true} }

        ],
        list: {
            title:'title',
            desc:'value'
        },
        title:'EntD',
        auth:{
            save:['admin'],
            list:[],
            update:['admin'],
            get:[],
            delete:['admin']
        }
    }
    
    module.exports = model;
    
})()