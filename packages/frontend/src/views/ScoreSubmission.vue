<template>
  <div>
    <h2>Submit Your Score</h2>
    <form @submit.prevent="handleSubmitScore">
      <div>
        <label for="score">Score:</label>
        <input type="number" id="score" v-model.number="score" required min="0" />
      </div>
      <button type="submit">Submit Score</button>
    </form>
    <p v-if="message" style="color: green">{{ message }}</p>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { submitScore } from '../services/api';

export default defineComponent({
  name: 'ScoreSubmission',
  setup() {
    const score = ref<number | null>(null);
    const message = ref<string | null>(null);
    const error = ref<string | null>(null);

    const handleSubmitScore = async () => {
      message.value = null;
      error.value = null;
      if (score.value === null || score.value < 0) {
        error.value = 'Please enter a valid non-negative score.';
        return;
      }

      try {
        const response = await submitScore(score.value);
        message.value = response.message || 'Score submitted successfully!';
        score.value = null; // Clear the input after submission
      } catch (err: any) {
        error.value = err.message || 'An error occurred during score submission.';
        console.error(err);
      }
    };

    return {
      score,
      message,
      error,
      handleSubmitScore,
    };
  },
});
</script>

<style scoped>
/* Basic styling */
div {
  max-width: 400px;
  margin: 20px auto;
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
input[type='number'] {
  width: 100%;
  padding: 10px;
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
}
button:hover {
  background-color: #45a049;
}
</style>
