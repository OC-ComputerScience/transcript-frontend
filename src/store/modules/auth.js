import axios from 'axios';

const state = {
  status: {
    loggedIn: false,
    loggingIn: false
  },
  user: null
};

const getters = {
  isLoggedIn: state => state.status.loggedIn,
  currentUser: state => state.user
};

const actions = {
  async login({ commit }, user) {
    commit('loginRequest');
    try {
      const response = await axios.post('/api/auth/signin', user);
      const userData = response.data;
      commit('loginSuccess', userData);
      return userData;
    } catch (error) {
      commit('loginFailure');
      throw error;
    }
  },

  async logout({ commit }) {
    try {
      await axios.post('/api/auth/signout');
      commit('logout');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
};

const mutations = {
  loginRequest(state) {
    state.status.loggingIn = true;
  },
  loginSuccess(state, user) {
    state.status.loggedIn = true;
    state.status.loggingIn = false;
    state.user = user;
  },
  loginFailure(state) {
    state.status.loggedIn = false;
    state.status.loggingIn = false;
    state.user = null;
  },
  logout(state) {
    state.status.loggedIn = false;
    state.user = null;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 