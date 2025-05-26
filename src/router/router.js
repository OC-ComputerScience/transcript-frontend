import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import University from '../components/University.vue';
import OCCourse from '../components/OCCourse.vue';
import UniversityCourse from '../components/UniversityCourse.vue';
import UniversityTranscript from '../components/UniversityTranscript.vue';
import TranscriptCourse from '../components/TranscriptCourse.vue';
import Semester from '../components/Semester.vue';
import Catalog from '../components/Catalog.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/universities',
    name: 'Universities',
    component: University
  },
  {
    path: '/oc-courses',
    name: 'OC Courses',
    component: OCCourse
  },
  {
    path: '/university-courses',
    name: 'University Courses',
    component: UniversityCourse
  },
  {
    path: '/transcripts',
    name: 'Transcripts',
    component: UniversityTranscript
  },
  {
    path: '/transcript-courses/:id',
    name: 'Transcript Courses',
    component: TranscriptCourse,
    props: true
  },
  {
    path: '/semesters',
    name: 'Semesters',
    component: Semester
  },
  {
    path: '/catalogs',
    name: 'Catalogs',
    component: Catalog
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 