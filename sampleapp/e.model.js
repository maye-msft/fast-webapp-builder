(()=>{



    const model = {
        name: 'entE',
        schema: [
            { title: {type: 'string', required: true} },
            { value: {type: 'date', required: true} }

        ],
        list: {
            title:'title',
            desc:'value'
        },
        title:'EntE',

    }
    
    module.exports = model;
    
})()