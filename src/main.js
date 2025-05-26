import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";

import axios from "axios";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";

// Configure axios
axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "light"
  }
});

const app = createApp(App);

app.use(router)
   .use(vuetify)
   .mount("#app");
