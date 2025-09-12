<template>
  <div>
    <h2>Welcome Home!</h2>
    <p>This is the main application area.</p>
    <nav>
      <template v-if="userStore.accessToken">
        <router-link to="/submit-score">Submit Score</router-link> |
        <router-link to="/leaderboard">Leaderboard</router-link>
      </template>
    </nav>

    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { userStore } from '../store/user';

export default defineComponent({
  name: 'Home',
  setup() {
    return {
      userStore, // Expose userStore to the template
    };
  },
});
</script>

<style scoped>
/* Basic styling for home */
div {
  text-align: center;
  margin-top: 50px;
}
nav {
  margin-top: 20px;
  margin-bottom: 20px;
}
nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #007bff;
}
nav a:hover {
  text-decoration: underline;
}
</style>
