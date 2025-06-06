import axios from "axios";
import Utils from "../utils/utils.js";
import AuthServices from "./authServices.js";
import Router from "../router/router.js";

var baseurl = "";
if (import.meta.env.DEV) {
  baseurl = "http://localhost:3100/transcript/";
} else {
  baseurl = "/transcript/";
}

const apiClient = axios.create({
  baseURL: baseurl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Access-Control-Allow-Origin": "*",
    crossDomain: true,
  },
  transformRequest: (data, headers) => {
    let user = Utils.getStore("user");
    if (user != null) {
      let token = user.token;
      let authHeader = "";
      if (token != null && token != "") authHeader = "Bearer " + token;
      headers["Authorization"] = authHeader;
    }
    return JSON.stringify(data);
  },
  transformResponse: function (data) {
    try {
      data = JSON.parse(data);

      if (data.message !== undefined && 
          (data.message.includes("Unauthorized") || 
           data.message.includes("Token expired") ||
           data.message.includes("Invalid token") ||
           data.message.includes("No Auth Header"))) {
        Utils.removeItem("user");
        Router.push('/login');
        return Promise.reject(data);
      }

      return data;
    } catch (error) {
      console.error('Error in transformResponse:', error);
      return data;
    }
  },
});

export default apiClient;
