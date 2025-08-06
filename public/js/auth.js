async function registerUser(email, password, preferred_username, name) {
  return await makeApiCall("/auth/register", "POST", {
    email,
    password,
    preferred_username,
    name,
  });
}

async function loginUser(email, password) {
  return await makeApiCall("/auth/login", "POST", { email, password });
}

function handleLogout() {
  localStorage.removeItem("accessToken");
  showMessage("Logged out successfully.", "info");
  document.getElementById("logout-btn").classList.add("hidden");
  renderAuthPage();
}
