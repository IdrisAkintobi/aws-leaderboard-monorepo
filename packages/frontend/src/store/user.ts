import { reactive } from 'vue';

// Define the structure of the user state
interface UserState {
  accessToken: string | null;
  idToken: string | null;
  name: string | null;
}

// Create a reactive store
export const userStore = reactive<UserState>({
  accessToken: null,
  idToken: null,
  name: null,
});

// Function to decode the IdToken payload
function decodeToken(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
}

// Actions to manipulate the state
export const userActions = {
  // Initialize the store from localStorage on app startup
  init() {
    const idToken = localStorage.getItem('idToken');
    const accessToken = localStorage.getItem('accessToken');
    if (idToken && accessToken) {
      const decoded = decodeToken(idToken);
      userStore.accessToken = accessToken;
      userStore.idToken = idToken;
      userStore.name = decoded?.name || null;
    }
  },

  // Handle successful login
  login(idToken: string, accessToken: string) {
    const decoded = decodeToken(idToken);
    userStore.accessToken = accessToken;
    userStore.idToken = idToken;
    userStore.name = decoded?.name || null;

    localStorage.setItem('idToken', idToken);
    localStorage.setItem('accessToken', accessToken);
  },

  // Handle logout
  logout() {
    userStore.accessToken = null;
    userStore.idToken = null;
    userStore.name = null;

    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
  },
};

// Initialize the store immediately
userActions.init();
