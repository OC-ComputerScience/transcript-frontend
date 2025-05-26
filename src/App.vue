<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Utils from "./utils/utils";

const router = useRouter();

const menuItems = [
  { title: "Univ", path: "/universities" },
  { title: "OC Courses", path: "/oc-courses" },
  { title: "Univ Courses", path: "/university-courses" },
  { title: "Transcripts", path: "/university-transcripts" },
  { title: "Transcript Courses", path: "/transcript-courses" },
];

function isLoggedIn() {
  let loggedIn = Utils.getStore("user") != null ? true : false;
  return loggedIn;
}

const logout = async () => {
  try {
    Utils.removeStore("user");
    await router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
</script>

<template>
  <v-app>
    <v-app-bar app color="#800000" dark>
      <router-link to="/" class="text-decoration-none">
        <v-img
          src="oc-logo-white.png"
          max-width="40"
          class="mr-4"
          contain
        ></v-img>
      </router-link>
      <v-toolbar-title class="white--text">Transcript Eval</v-toolbar-title>
      <v-spacer></v-spacer>

      <template v-if="isLoggedIn">
        <v-btn
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          text
          class="mx-2 white--text"
        >
          {{ item.title }}
        </v-btn>
        <v-divider vertical class="mx-2 white"></v-divider>
        <v-btn @click="logout" text class="white--text">Logout</v-btn>
      </template>
      <v-btn v-else to="/login" text class="white--text">Login</v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>
