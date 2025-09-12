<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <input type="email" id="email" v-model="email" placeholder="Email" required />
      </div>
      <div>
        <input type="password" id="password" v-model="password" placeholder="Password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="error" style="color: red">{{ error }}</p>
    <p>
      Don't have an account?
      <router-link to="/register">Register here</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { login } from '../services/api';
import { userActions } from '../store/user';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Login',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref<string | null>(null);
    const router = useRouter();

    const handleLogin = async () => {
      error.value = null;
      try {
        const data = await login(email.value, password.value);
        if (data.IdToken && data.AccessToken) {
          userActions.login(data.IdToken, data.AccessToken);
          router.push('/'); // Redirect to home or dashboard after successful login
        } else {
          throw new Error('Login failed: Invalid token response');
        }
      } catch (err: any) {
        error.value = err.message || 'An error occurred during login.';
        console.error(err);
      }
    };

    return {
      email,
      password,
      error,
      handleLogin,
    };
  },
});
</script>

<style scoped>
/* Add some basic styling */
div {
  max-width: 400px;
  margin: 20px auto;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
form {
  padding: 12px;
}
form div {
  margin-bottom: 10px;
}
label {
  display: none; /* Hide labels */
}
input[type='text'],
input[type='password'],
input[type='email'] {
  width: 100%;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 5px; /* Reduced space above the button */
}
button:hover {
  background-color: #45a049;
}
</style>
