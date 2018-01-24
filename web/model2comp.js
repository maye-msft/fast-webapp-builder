var Schema = Schema || {}
Schema.Types = Schema.Types || {}
Schema.Types.ObjectId = Schema.Types.ObjectId || {}


function model2view(model, rountes, menus) {
    if(!model)
        return;
    let fields = [];
    let dataobj = {};
    let dataitems = {};
    let datafill = {};
    const modelName = model.name;
    const isRequired = function (required) {
        return required ? '' : 'required';
    }
    for (let item of model.schema) {

        for (let key in item) {
            let name = key;
            let props = item[key]
            if(Array.isArray(props)) {
                if (props[0].type === 'ObjectId' ) {
                    fields.push(`<v-select
                            v-bind:items="dataitems.${name}"
                            v-model="dataobj.${name}"
                            label="${name}"
                            multiple
                        ></v-select>`);
                    dataitems[name] = []
                    datafill[name] = function(cb) {
                        axios({
                            method: 'get',
                            url: '/api/' + props[0].ref,
                            responseType: 'json',
                            headers:{
                                "x-access-token":store.state.token?store.state.token.token:''
                            }
                        }).then(function (response) {
                            var array = [];
                            for(let i=0;i<response.data.length;i++) {
                                array.push({
                                    value:response.data[i]._id,
                                    text:response.data[i][Schema[props[0].ref].list.title]
                                    }
                                )
                            }
                            cb(array);
                        }).catch(function (error) {
                            console.log(error)
                            store.commit('addError', error)
                        });
                    }
                }
            } else {
                if (props.type === 'string') {
                    fields.push(`<v-text-field
                            v-model="dataobj.${name}"
                            label="${name}"
                            type="${props.password ? 'password' : 'text'}"
                            data-vv-name="dataobj.${name}"
                            ${isRequired(props.required)}
                        ></v-text-field>`);
                } else if (props.type === 'number') {
                    fields.push(`<v-text-field
                            v-model="dataobj.${name}"
                            label="${name}"
                            data-vv-name="dataobj.${name}"
                            ${isRequired(props.required)}
                            type="number"
                        ></v-text-field>`);
                } else if (props.type === 'date') {
                    fields.push(`<v-text-field
                            v-model="dataobj.${name}"
                            label="${name}"
                            data-vv-name="dataobj.${name}"
                            ${isRequired(props.required)}
                            type="date"
                        ></v-text-field>`);
                } else if (props.type === 'ObjectId' ) {
                    fields.push(`<v-select
                            v-bind:items="dataitems.${name}"
                            v-model="dataobj.${name}"
                            label="${name}"
                            single-line
                            bottom
                        ></v-select>`);
                    dataitems[name] = []
                    datafill[name] = function(cb) {
                        axios({
                            method: 'get',
                            url: '/api/' + props.ref,
                            responseType: 'json',
                            headers:{
                                "x-access-token":store.state.token?store.state.token.token:''
                            }
                        }).then(function (response) {
                            var array = [];
                            for(let i=0;i<response.data.length;i++) {
                                array.push({
                                    value:response.data[i]._id,
                                    text:response.data[i][Schema[props.ref].list.title]
                                    }
                                )
                            }
                            cb(array);
                        }).catch(function (error) {
                            console.log(error)
                            store.commit('addError', error)
                        });
                    }
                }
            }

            dataobj[name] = null
        }

    }
    const createtemplate = `<form>
    <v-btn small fab dark color="indigo" @click="router.push({ name: '${modelName}-list' })">
    <v-icon dark>arrow_back</v-icon>
    </v-btn>

        <h3>Create ${modelName}</h3>
        <p><p>
        ${fields.join("")}
        
        <v-btn @click="submit">Create</v-btn>
        <v-btn @click="clear">Clear</v-btn>
    </form>`;

    const createview = {
        template: createtemplate,
        store:store,
        data() {
            return {
                dataobj:dataobj,
                dataitems:dataitems
            }
        },
        methods: {
            submit() {
                let that = this;
                axios({
                    method: 'put',
                    url: '/api/' + modelName,
                    responseType: 'json',
                    data: that.dataobj,
                    headers:{
                        "x-access-token":store.state.token?store.state.token.token:''
                    }

                }).then(function (response) {
                    that.clear();
                    router.push({ name: `${modelName}-list` })
                }).catch(function (error) {
                    console.log(error)
                    store.commit('addError', error)
                });
                // this.$store.commit("add_farm_operator", dataobj)
                // this.clear();
                // router.push({ name: 'farm-operator-list' })
            },
            clear() {
                for (let key in this.dataobj) {
                    this.dataobj[key] = ""
                }
            }
        },
        mounted() {
            for(let key in datafill) {
                 datafill[key]((data)=>dataitems[key]=data);
            }
        }
    }
    const listview = {
        template: `
        <div>


        <v-btn small fab dark color="indigo" @click="gotoCreateView">
        <v-icon dark>add</v-icon>
        </v-btn>

        <v-list two-line subheader>
        <v-subheader>${modelName}</v-subheader>
        <v-list-tile avatar v-for="(obj, idx) in objs" @click="gotoEditView(obj._id)">
          <v-list-tile-content >
            <v-list-tile-title>{{obj["${model.list.title}"]}}</v-list-tile-title>
            <v-list-tile-sub-title>{{obj["${model.list.desc}"]}}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        </v-list>
        </div>
        `,
        store:store,
        data() {
            return {
                objs: []
            }
        },
        methods: {
            loadAll() {
                let that = this;
                axios({
                    method: 'get',
                    url: '/api/' + modelName,
                    responseType: 'json',
                    headers:{
                        "x-access-token":store.state.token?store.state.token.token:''
                    }
                }).then(function (response) {
                    that.objs = response.data;
                }).catch(function (error) {
                    console.log(error)
                    store.commit('addError', error)
                });
            },
            gotoEditView(id) {
                router.push({ name: `${modelName}-edit`, params:{id:id} })
            },


            gotoCreateView() {
                router.push({ name: `${modelName}-create` })
            }
        },
        mounted() {
            this.loadAll();
        }
    }
    // Vue.component(`${modelName}-editview`, {
    const updatetemplate = `<form>
    <v-btn small fab dark color="indigo" @click="router.push({ name: '${modelName}-list' })">
        <v-icon dark>arrow_back</v-icon>
        </v-btn>


        <h3>Update ${modelName}</h3>
        <p><p>
        ${fields.join("")}
        <p>Created at: {{dataobj.created_at}}<p>
        <p>Updated at: {{dataobj.updatedAt}}<p>
        <v-btn @click="submit">Update</v-btn>
        <v-btn @click="clear">Clear</v-btn>
        <v-btn @click="deleteObj">Delete</v-btn>
    </form>`;
    const editview = {
        props:["id"],
        store:store,
        template: updatetemplate,
        data() {
            return {
                dataobj:dataobj,
                dataitems:dataitems
            }
        },
        methods: {
            submit() {
                let that = this;
                axios({
                    method: 'post',
                    url: '/api/' + modelName+'/'+that.id,
                    responseType: 'json',
                    data: that.dataobj,
                    headers:{
                        "x-access-token":store.state.token?store.state.token.token:''
                    }

                }).then(function (response) {
                    that.clear();
                    router.push({ name: `${modelName}-list` })
                }).catch(function (error) {
                    console.log(error)
                    store.commit('addError', error)
                });
                // this.$store.commit("add_farm_operator", dataobj)
                // this.clear();
                // router.push({ name: 'farm-operator-list' })
            },
            deleteObj() {
                let that = this;
                axios({
                    method: 'delete',
                    url: '/api/' + modelName+'/'+that.id,
                    responseType: 'json',
                    headers:{
                        "x-access-token":store.state.token?store.state.token.token:''
                    }

                }).then(function (response) {
                    that.clear();
                    router.push({ name: `${modelName}-list` })
                }).catch(function (error) {
                    console.log(error)
                    store.commit('addError', error)
                });
                // this.$store.commit("add_farm_operator", dataobj)
                // this.clear();
                // router.push({ name: 'farm-operator-list' })
            },
            clear() {
                for (let key in this.dataobj) {
                    this.dataobj[key] = ""
                }
            },
            loadObj() {
                let that = this;
                axios({
                    method: 'get',
                    url: '/api/' + modelName+'/'+that.id,
                    responseType: 'json',
                    headers:{
                        "x-access-token":store.state.token?store.state.token.token:''
                    }
                }).then(function (response) {
                    that.dataobj = response.data;
                }).catch(function (error) {
                    console.log(error)
                    store.commit('addError', error)
                });
            },
        },
        mounted() {
            this.loadObj()
            for(let key in datafill) {
                datafill[key]((data)=>dataitems[key]=data);
            }
        }
    };
    routes.push({ name: `${modelName}-create`, path: `/${modelName}-create`, component: createview });
    routes.push({ name: `${modelName}-list`, path: `/${modelName}-list`, component: listview });
    routes.push({ name: `${modelName}-edit`, path: `/${modelName}-edit/:id`, props: true, component: editview });
    
    menus.push({path: `/${modelName}-list`, title: model.title})


}

