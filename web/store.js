const store = new Vuex.Store({
    state: {
        token:null,
        errors:[]
    },
    mutations: {
        setToken:function(state, token) {
            state.token = token
        },
        addError:function(state, error) {
            error.ts = new Date();
            state.errors.push(error);
        },
        clearError:function(state, error) {
            state.errors = [];
        }
    }
});