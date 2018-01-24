(()=>{



    const model = {
        name: 'entC',
        schema: [
            { title: {type: 'string', required: true} },
            { value: {type: 'number', required: true} }

        ],
        list: {
            title:'title',
            desc:'value'
        },
        title:'EntC'
    }
    
    if (typeof(module)!='undefined'  && module.exports) {
        module.exports = model;
    } else if (window) {
        window.Schema = window.Schema || {};
        window.Schema[model.name] = model
    }
    
})()
