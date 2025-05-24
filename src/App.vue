<script>
export default {
  name: "App",
  data: () => ({
    drawer: null,
    menuItems: [
      { title: "Universities", icon: "mdi-school", path: "/universities" },
      { title: "OC Courses", icon: "mdi-book", path: "/oc-courses" },
      {
        title: "University Courses",
        icon: "mdi-book-open",
        path: "/university-courses",
      },
      {
        title: "University Transcripts",
        icon: "mdi-file-document",
        path: "/university-transcripts",
      },
      {
        title: "Transcript Courses",
        icon: "mdi-file-document-edit",
        path: "/transcript-courses",
      },
    ],
  }),

  computed: {
    isLoggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },

  methods: {
    async logout() {
      await this.$store.dispatch("auth/logout");
      this.$router.push("/login");
    },
  },
};
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Transcript Management System</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="!isLoggedIn" to="/login" text>Login</v-btn>
      <v-btn v-else @click="logout" text>Logout</v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>
