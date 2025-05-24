import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import University from '../components/University.vue';
import OCCourse from '../components/OCCourse.vue';
import UniversityCourse from '../components/UniversityCourse.vue';
import UniversityTranscript from '../components/UniversityTranscript.vue';
import TranscriptCourse from '../components/TranscriptCourse.vue';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/universities',
    name: 'Universities',
    component: University,
    meta: { requiresAuth: true }
  },
  {
    path: '/oc-courses',
    name: 'OCCourses',
    component: OCCourse,
    meta: { requiresAuth: true }
  },
  {
    path: '/university-courses',
    name: 'UniversityCourses',
    component: UniversityCourse,
    meta: { requiresAuth: true }
  },
  {
    path: '/university-transcripts',
    name: 'UniversityTranscripts',
    component: UniversityTranscript,
    meta: { requiresAuth: true }
  },
  {
    path: '/transcript-courses',
    name: 'TranscriptCourses',
    component: TranscriptCourse,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.auth.status.loggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router; 