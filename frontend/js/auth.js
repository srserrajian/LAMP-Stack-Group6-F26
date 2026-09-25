// ---------- ERROR HELPER ----------
function showError(message, targetElementId) {
  const el = document.getElementById(targetElementId);
  if (el) {
    el.textContent = message;
    el.classList.remove("d-none");
  }
}

function clearMessage(targetElementId) {
  const el = document.getElementById(targetElementId);
  if (el) {
    el.textContent = "";
    el.classList.add("d-none");
  }
}

// ---------- LOGIN ----------
async function doLogin(event) {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  clearMessage("loginError");

  if (!username || !password) {
    showError("Username and password are required", "loginError");
    return;
  }

  try {
    const response = await fetch(AUTH_BASE + "login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const role = data.user.role;
      if (role === "admin") {
        window.location.href = "dashboard-admin.html";
      } else {
        window.location.href = "dashboard-user.html";
      }
    } else if (response.status === 401) {
      showError("Invalid username or password", "loginError");
    } else if (response.status === 403) {
      showError("This account has been disabled", "loginError");
    } else {
      showError(data.error || "Login failed", "loginError");
    }
  } catch (err) {
    showError("Something went wrong. Please try again.", "loginError");
  }
}

// ---------- REGISTER ----------
async function doRegister(event) {
  event.preventDefault();

  const data = {
    first_name: document.getElementById("registerFirstName").value.trim(),
    last_name: document.getElementById("registerLastName").value.trim(),
    username: document.getElementById("registerName").value.trim(), // her HTML uses "registerName"
    email: document.getElementById("registerEmail").value.trim(),
    password: document.getElementById("registerPassword").value.trim(),
  };

  clearMessage("registerError");

  if (!data.first_name || !data.last_name || !data.username || !data.email || !data.password) {
    showError("All fields are required", "registerError");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(data.email)) {
    showError("Invalid email address", "registerError");
    return;
  }

  if (data.password.length < 8) {
    showError("Password must be at least 8 characters", "registerError");
    return;
  }

  try {
    const response = await fetch(AUTH_BASE + "register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = "index.html?registered=1";
    } else if (response.status === 409) {
      showError("Username or email already in use", "registerError");
    } else if (response.status === 400) {
      showError(result.error || "Please check your information", "registerError");
    } else {
      showError("Registration failed", "registerError");
    }
  } catch (err) {
    showError("Something went wrong. Please try again.", "registerError");
  }
}

// ---------- CHECK LOGIN STATE (page guard) ----------
async function checkAuth() {
  try {
    const response = await fetch(AUTH_BASE + "current.php", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const user = await response.json();
      const nameEl = document.getElementById("userName");
      if (nameEl) {
        nameEl.textContent = `Logged in as ${user.first_name} ${user.last_name}`;
      }
      return user;
    } else {
      window.location.href = "index.html";
      return null;
    }
  } catch (err) {
    window.location.href = "index.html";
    return null;
  }
}

// ---------- LOGOUT ----------
async function doLogout() {
  try {
    await fetch(AUTH_BASE + "logout.php", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    // ignore errors — logout should never leave the user stuck
  }
  window.location.href = "index.html";
}

// ---------- PAGE SETUP ----------
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", doLogin);

    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "1") {
      showError("Registration successful — please log in.", "loginSuccess");
      // reuse showError just for the text+visibility toggle — it's a generic message-shower now
      document.getElementById("loginSuccess").classList.remove("text-danger");
      document.getElementById("loginSuccess").classList.add("text-success");
    }
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", doRegister);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", doLogout);
  }
});