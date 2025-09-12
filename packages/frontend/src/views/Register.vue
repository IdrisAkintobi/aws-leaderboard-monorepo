<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <div>
        <input type="text" id="username" v-model="username" placeholder="Username" required />
      </div>
      <div>
        <input type="email" id="email" v-model="email" placeholder="Email" required />
      </div>
      <div>
        <input type="text" id="name" v-model="name" placeholder="Name" required />
      </div>
      <div>
        <input
          type="password"
          id="newPassword"
          v-model="password"
          placeholder="Password"
          required
        />
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="error" style="color: red">{{ error }}</p>
    <p>Already have an account? <router-link to="/login">Login here</router-link></p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { register } from '../services/api';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Register',
  setup() {
    const username = ref('');
    const email = ref('');
    const name = ref('');
    const password = ref('');
    const error = ref<string | null>(null);
    const router = useRouter();

    const handleRegister = async () => {
      error.value = null;
      try {
        await register(username.value, email.value, name.value, password.value);
        alert('Registration successful! Please verify your email.');
        router.push({ path: '/verify-token', query: { email: email.value } }); // Redirect to verify-token after successful registration
      } catch (err: any) {
        error.value = err.message || 'An error occurred during registration.';
        console.error(err);
      }
    };

    return {
      username,
      email,
      name,
      password,
      error,
      handleRegister,
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
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 5px; /* Reduced space above the button */
}
button:hover {
  background-color: #0056b3;
}
</style>
