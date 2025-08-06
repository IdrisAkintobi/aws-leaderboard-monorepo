// public/js/ui.js
// Handles all user interface rendering and state management.

function showMessage(message, type = "info") {
  const messageBox = document.getElementById("message-box");
  messageBox.textContent = message;
  messageBox.className = `p-4 rounded-lg text-sm font-medium ${
    type === "success"
      ? "bg-green-100 text-green-800"
      : type === "error"
      ? "bg-red-100 text-red-800"
      : "bg-blue-100 text-blue-800"
  }`;
  messageBox.classList.remove("hidden");
}

function renderAuthPage() {
  const contentArea = document.getElementById("content-area");
  contentArea.innerHTML = `
        <div id="auth-section" class="space-y-6 p-6 border border-gray-200 rounded-xl shadow-sm">
            <h2 class="text-2xl font-bold text-gray-800 text-center">Authentication</h2>
            <p class="text-center text-gray-500">Already have an account? Log in below.</p>
            <form id="login-form" class="space-y-4">
                <div>
                    <label class="block text-gray-700 font-medium mb-1" for="login-email">Email</label>
                    <input class="form-input" id="login-email" type="email" placeholder="Email" required>
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-1" for="login-password">Password</label>
                    <input class="form-input" id="login-password" type="password" placeholder="Password" required>
                </div>
                <button type="submit" class="btn-primary w-full">Log In</button>
            </form>
            <p class="text-center text-gray-500">Don't have an account? Register here.</p>
            <form id="register-form" class="space-y-4 mt-6">
                <div>
                    <label class="block text-gray-700 font-medium mb-1" for="reg-email">Email</label>
                    <input class="form-input" id="reg-email" type="email" placeholder="Email" required>
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-1" for="reg-username">Preferred Username</label>
                    <input class="form-input" id="reg-username" type="text" placeholder="Preferred Username" required>
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-1" for="reg-name">Name</label>
                    <input class="form-input" id="reg-name" type="text" placeholder="Your Name" required>
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-1" for="reg-password">Password</label>
                    <input class="form-input" id="reg-password" type="password" placeholder="Password" required>
                </div>
                <button type="submit" class="btn-primary w-full">Register</button>
            </form>
        </div>
    `;
}

function renderScoreboardPage(topScore) {
  const contentArea = document.getElementById("content-area");
  contentArea.innerHTML = `
        <div id="score-section" class="space-y-6 p-6 border border-gray-200 rounded-xl shadow-sm">
            <h2 class="text-2xl font-bold text-gray-800 text-center">Submit Score</h2>
            <p class="text-center text-gray-500">Must be logged in to submit a score.</p>
            <form id="score-form" class="space-y-4">
                <div>
                    <label class="block text-gray-700 font-medium mb-1" for="score-input">Your Score</label>
                    <input class="form-input" id="score-input" type="number" placeholder="Enter your score" required min="0">
                </div>
                <button type="submit" class="btn-primary w-full">Submit Score</button>
            </form>
        </div>
        <div id="leaderboard-section" class="space-y-6 p-6 border border-gray-200 rounded-xl shadow-sm">
            <h2 class="text-2xl font-bold text-gray-800 text-center">Leaderboard</h2>
            <div id="leaderboard-display" class="bg-gray-50 p-4 rounded-lg shadow-inner">
                ${
                  topScore
                    ? `
                    <p class="text-lg font-semibold">Current Top Score:</p>
                    <p>User: <span class="font-bold">${
                      topScore.user_name
                    }</span></p>
                    <p>Score: <span class="font-bold">${
                      topScore.score
                    }</span></p>
                    <p class="text-sm text-gray-500">Submitted at: ${new Date(
                      topScore.timestamp * 1000
                    ).toLocaleString()}</p>
                `
                    : `<p class="text-gray-500 text-center">No scores submitted yet.</p>`
                }
            </div>
            <button id="refresh-leaderboard-btn" class="btn-primary w-full">Refresh Leaderboard</button>
        </div>
    `;
}

function updateLeaderboardDisplay(topScore) {
  const leaderboardDisplay = document.getElementById("leaderboard-display");
  if (topScore) {
    leaderboardDisplay.innerHTML = `
            <p class="text-lg font-semibold">Current Top Score:</p>
            <p>User: <span class="font-bold">${topScore.user_name}</span></p>
            <p>Score: <span class="font-bold">${topScore.score}</span></p>
            <p class="text-sm text-gray-500">Submitted at: ${new Date(
              topScore.timestamp * 1000
            ).toLocaleString()}</p>
        `;
  } else {
    leaderboardDisplay.innerHTML = `<p class="text-gray-500 text-center">No scores submitted yet.</p>`;
  }
}

function showRealtimeNotification(notification) {
  const realtimeNotification = document.getElementById("realtime-notification");
  realtimeNotification.textContent = notification;
  realtimeNotification.classList.remove("hidden");
  // Automatically hide after a few seconds
  setTimeout(() => realtimeNotification.classList.add("hidden"), 5000);
}
