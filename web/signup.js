Vue.component("signup-view", {
    template: `
    <form>
        <h3>Sign Up</h3>
        <v-text-field
            v-model="name"
            label="User Name"
            :counter="30"
            v-validate="'required|max:30'"
            data-vv-name="name"
            required
        ></v-text-field>
        <v-text-field
            name="password"
            label="Enter your password"
            v-model="password"
            v-validate="'required|max:16'"
            :counter="16"
            type="password"
        ></v-text-field>
        <v-text-field
            name="password2"
            label="Enter your password again"
            v-model="password2"
            v-validate="'required|max:16'"
            :counter="16"
            type="password"
        ></v-text-field>
        <v-select
            v-bind:items="roles"
            v-model="role"
            label="Role"
            multiple
        ></v-select>

        <v-btn @click="submit">submit</v-btn>
        <v-btn @click="clear">clear</v-btn>
        <v-btn @click="router.push({ name: 'signin' })">Sign In</v-btn>
    </form>
    `,


    data () {
      return {
        name: '',
        password: '',
        password2: '',
        roles:[],
        role:[]
      }
    },
    methods: {
      submit () {
        let that = this;
        axios({
            method: 'post',
            url: '/register',
            responseType: 'json',
            data: {
                username:this.name,
                password:this.password,
                role:this.role
            }
        }).then(function (response) {
            that.clear();
            router.push({ name: 'signin' })
        }).catch(function (error) {
            console.log(error);
            alert(error.response.data.message)
        });
        
      },
      clear () {
        this.name = ''
        this.password = ''
        this.password2 = ''
        this.role = []
        this.roles = []
      }
    },

    mounted () {
        var that = this;
        axios({
            method: 'get',
            url: '/role',
            responseType: 'json'
        }).then(function (response) {
            that.roles = response.data;
        }).catch(function (error) {
            console.log(error)
        });
    }
});