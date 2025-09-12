<template>
  <div>
    <h2>Leaderboard</h2>
    <p v-if="loading">Loading leaderboard...</p>
    <p v-if="error" style="color: red">{{ error }}</p>
    <div v-if="topScore">
      <h3>Top Score:</h3>
      <p><strong>User:</strong> {{ topScore.user_name }}</p>
      <p><strong>Score:</strong> {{ topScore.score }}</p>
      <p>
        <strong>Submitted At:</strong> {{ new Date(topScore.timestamp * 1000).toLocaleString() }}
      </p>
    </div>
    <p v-else-if="!loading">No scores yet.</p>
    <button @click="fetchLeaderboard">Refresh Leaderboard</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getLeaderboard } from '../services/api';

interface ScoreEntry {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  timestamp: number;
}

export default defineComponent({
  name: 'Leaderboard',
  setup() {
    const topScore = ref<ScoreEntry | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    const fetchLeaderboard = async () => {
      loading.value = true;
      error.value = null;
      try {
        const data = await getLeaderboard();
        topScore.value = data.topScore;
      } catch (err: any) {
        error.value = err.message || 'Failed to fetch leaderboard.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchLeaderboard);

    return {
      topScore,
      loading,
      error,
      fetchLeaderboard,
    };
  },
});
</script>

<style scoped>
/* Basic styling */
div {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
h3 {
  color: #333;
}
p {
  margin: 5px 0;
}
button {
  background-color: #007bff;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}
button:hover {
  background-color: #0056b3;
}
</style>
