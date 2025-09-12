<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <span v-if="userStore.accessToken"
        >Welcome, {{ userName }} | <a href="#" @click.prevent="handleLogout">Logout</a></span
      >
      <span v-else>
        <router-link to="/login">Login</router-link> |
        <router-link to="/register">Register</router-link>
      </span>
    </nav>
    <router-view />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { connectWebSocket, disconnectWebSocket } from './services/websocket';
import { userActions, userStore } from './store/user';

export default defineComponent({
  name: 'App',
  setup() {
    const router = useRouter();
    const userName = computed(() => userStore.name);

    const handleLogout = () => {
      userActions.logout();
      router.push('/login');
    };

    // Watch for changes in accessToken (To connect when user log in and disconnect when log out)
    watch(
      () => userStore.accessToken,
      newVal => {
        if (newVal) {
          connectWebSocket(newVal);
        } else {
          disconnectWebSocket();
        }
      },
      { immediate: true }
    ); // Run immediately on component mount

    // Ensure WebSocket is connected if user is already logged in on app load
    onMounted(() => {
      if (userStore.accessToken) {
        connectWebSocket(userStore.accessToken);
      }
    });
    onUnmounted(() => {
      disconnectWebSocket();
    });

    return { userName, handleLogout, userStore };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  margin-bottom: 20px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b983;
}

nav span a {
  cursor: pointer;
}
</style>
