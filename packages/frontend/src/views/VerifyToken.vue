<template>
  <div>
    <h2>Verify Your Account</h2>
    <p>
      A verification token has been sent to your email. Please enter it below to activate your
      account.
    </p>
    <form @submit.prevent="handleVerification">
      <div>
        <label for="token">Verification Token:</label>
        <input type="text" id="token" v-model="token" required />
      </div>
      <button type="submit">Verify</button>
    </form>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { verifyToken } from '../services/api';

export default defineComponent({
  name: 'VerifyToken',
  setup() {
    const token = ref('');
    const error = ref<string | null>(null);
    const router = useRouter();
    const route = useRoute();
    const email = ref((route.query.email as string) || '');

    const handleVerification = async () => {
      error.value = null;
      try {
        await verifyToken(email.value, token.value);
        alert('Account verified successfully! You can now log in.');
        router.push('/login');
      } catch (err: any) {
        error.value = err.message || 'An error occurred during verification.';
        console.error(err);
      }
    };

    return {
      token,
      error,
      handleVerification,
    };
  },
});
</script>

<style scoped>
/* Styles copied from Register.vue for consistency */
div {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
form div {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input[type='text'] {
  width: 100%;
  padding: 10px;
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
}
button:hover {
  background-color: #0056b3;
}
</style>
