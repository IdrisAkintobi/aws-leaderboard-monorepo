import { createRouter, createWebHistory, type NavigationGuardNext } from 'vue-router';
import { userStore } from '../store/user';

import Home from '../views/Home.vue';
import Leaderboard from '../views/Leaderboard.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ScoreSubmission from '../views/ScoreSubmission.vue';
import VerifyToken from '../views/VerifyToken.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/verify-token', name: 'VerifyToken', component: VerifyToken },
  {
    path: '/submit-score',
    name: 'SubmitScore',
    component: ScoreSubmission,
    meta: { requiresAuth: true },
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: Leaderboard,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next: NavigationGuardNext) => {
  // Check if the route requires authentication and if the user is logged in
  if (to.matched.some(record => record.meta.requiresAuth) && !userStore.accessToken) {
    // Redirect to the login page if not authenticated
    next('/login');
  } else {
    next(); // Proceed as normal
  }
});

export default router;
