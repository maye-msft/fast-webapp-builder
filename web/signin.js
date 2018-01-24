Vue.component("signin-view", {
    store:store,
    template: `
    <form>
        <h3>Sign In</h3>
        <v-text-field
            v-model="name"
            label="User Name"
            :counter="30"
            v-validate="'required|max:30'"
            data-vv-name="name"
            required
        ></v-text-field>
        <v-text-field
            name="input-10-1"
            label="Enter your password"
            v-model="password"
            v-validate="'required|max:16'"
            :counter="16"
            type="password"
        ></v-text-field>


        <v-btn @click="submit">submit</v-btn>
        <v-btn @click="clear">clear</v-btn>
        <v-btn @click=" router.push({ name: 'signup' })">Sign Up</v-btn>
    </form>
    `,


    data () {
      return {
        name: '',
        password: '',
      }
    },
    methods: {
      submit () {
        let that = this;
        axios({
            method: 'post',
            url: '/login',
            responseType: 'json',
            data: {
                username:this.name,
                password:this.password,
            }
        }).then(function (response) {
            that.clear();
            console.log(response.data)
            store.commit('setToken', response.data)
            router.push({ name: 'hello' })
            
        }).catch(function (error) {
            console.log(error);
            alert(error.response.data.message)
            store.commit('addError', error.response.data)
        });
      },
      clear () {
        this.name = ''
        this.password = ''
      }
    },

    mounted () {

    }
});