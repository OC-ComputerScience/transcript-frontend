<script>
export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async handleLogin() {
      try {
        await this.$store.dispatch("auth/login", {
          username: this.username,
          password: this.password,
        });
        const redirectPath = this.$route.query.redirect || "/";
        this.$router.push(redirectPath);
      } catch (error) {
        console.error("Login failed:", error);
        // You might want to show an error message to the user here
      }
    },
  },
};
</script>

<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                prepend-icon="mdi-account"
                name="username"
                label="Username"
                type="text"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                prepend-icon="mdi-lock"
                name="password"
                label="Password"
                type="password"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="handleLogin">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
