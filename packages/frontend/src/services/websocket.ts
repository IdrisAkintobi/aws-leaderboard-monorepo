import { ref } from 'vue';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

const socket = ref<WebSocket | null>(null);

export const connectWebSocket = (accessToken: string) => {
  if (socket.value) {
    console.log('WebSocket already connected.');
    return;
  }

  socket.value = new WebSocket(`${WEBSOCKET_URL}?token=${accessToken}`);

  socket.value.onopen = () => {
    console.log('WebSocket connected.');
    // Ping the websocket to get the connectionId
    socket.value?.send(JSON.stringify({ action: 'echo' }));
  };

  socket.value.onmessage = event => {
    try {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received:', message);
      if (message.action === 'high-score-update') {
        alert(`New Notification! User: ${message.data.user_name}, Score: ${message.data.score}`);
      } else if (message.action === 'echo') {
        console.log('Echo received:', message.data);
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  };

  socket.value.onclose = () => {
    console.log('WebSocket disconnected.');
    socket.value = null;
  };

  socket.value.onerror = error => {
    console.error('WebSocket error:', error);
  };
};

export const disconnectWebSocket = () => {
  if (socket.value) {
    socket.value.close();
    socket.value = null;
    console.log('Initiated WebSocket disconnection.');
  }
};
