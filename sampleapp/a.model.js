(()=>{



    const model = {
        name: 'entA',
        schema: [
            { title: {type: 'string', required: true} },
            { value: {type: 'number', required: true} },
            { B: { type: 'ObjectId', ref: 'entB' } },
            { C: [{ type: 'ObjectId', ref: 'entC' }] }
        ],
        list: {
            title:'title',
            desc:'value'
        },
        title:'EntA',
        callback:{
            before_save:(objs)=>{
                for(let i=0;i<objs.length;i++) {
                    objs[i].title = objs[i].title+'-x'
                }
            }
        }
    }
    
    if (typeof(module)!='undefined'  && module.exports) {
        module.exports = model;
    } else if (window) {
        window.Schema = window.Schema || {};
        window.Schema[model.name] = model
    }
    
})()
