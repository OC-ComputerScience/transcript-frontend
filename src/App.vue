<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Utils from "./utils/utils";
import ocLogo from "/oc-logo-white.png";
import AuthServices from "./services/authServices";

const router = useRouter();
const logoURL = ref();

logoURL.value = ocLogo;

const menuItems = [
  { title: "Transcripts", path: "/transcripts" },
  { title: "Universities", path: "/universities" },
  { title: "University Courses", path: "/university-courses" },
  { title: "OC Courses", path: "/oc-courses" },
  { title: "Semesters", path: "/semesters" },
];

function isLoggedIn() {
  let loggedIn = Utils.getStore("user") != null ? true : false;
  return loggedIn;
}

const logout = async () => {
  let user = Utils.getStore("user");
  if (user != null) {
    try {
      await AuthServices.logoutUser(user);
      Utils.removeItem("user");
      router.push({ name: "Login" });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the server request fails, we should still log out locally
      Utils.removeItem("user");
      router.push({ name: "Login" });
    }
  } else {
    // If no user is found, just redirect to login
    router.push({ name: "Login" });
  }
};
</script>

<template>
  <v-app>
    <v-app-bar app color="#800000" dark>
      <router-link :to="{ name: 'Home' }">
        <v-img
          class="mx-2"
          :src="logoURL"
          height="50"
          width="50"
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
          class="mx-1 px-2 white--text"
          density="compact"
        >
          {{ item.title }}
        </v-btn>
        <v-divider vertical class="mx-1 white"></v-divider>
        <v-btn
          @click="logout"
          text
          class="mx-1 px-2 white--text"
          density="compact"
          >Logout</v-btn
        >
      </template>
      <v-btn
        v-else
        to="/login"
        text
        class="mx-1 px-2 white--text"
        density="compact"
        >Login</v-btn
      >
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>
