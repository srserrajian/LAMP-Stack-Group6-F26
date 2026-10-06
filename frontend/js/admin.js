// ---------- STATE ----------
let currentUsers = [];
let currentAdminId = null; // the logged-in admin, so they cannot change their own role
let selectedUserId = null; // tracks which user the password modal is acting on

// ---------- ERROR HELPERS ----------
function showAdminError(message) {
  const el = document.getElementById("adminError");
  if (el) {
    el.textContent = message;
    el.classList.remove("d-none");
  }
}

function clearAdminError() {
  const el = document.getElementById("adminError");
  if (el) {
    el.textContent = "";
    el.classList.add("d-none");
  }
}

function showChangePasswordError(message) {
  const el = document.getElementById("changePasswordError");
  if (el) {
    el.textContent = message;
    el.classList.remove("d-none");
  }
}

function clearChangePasswordError() {
  const el = document.getElementById("changePasswordError");
  if (el) {
    el.textContent = "";
    el.classList.add("d-none");
  }
}

// ---------- LOAD ALL USERS ----------
async function loadUsers() {
  try {
    const response = await fetch(ADMIN_BASE + "all_users.php", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      currentUsers = data.users; // wrapped, not a bare array
      renderUserList(currentUsers);
    } else if (response.status === 403) {
      showAdminError("Admin access required");
    } else {
      const data = await response.json();
      showAdminError(data.error || "Failed to load users");
    }
  } catch (err) {
    showAdminError("Something went wrong loading users");
  }
}

// ---------- SEARCH USERS ----------
async function searchUsers(query) {
  if (!query) {
    loadUsers();
    return;
  }

  try {
    const response = await fetch(
      ADMIN_BASE + "all_users.php?search=" + encodeURIComponent(query),
      { method: "GET", credentials: "include" }
    );

    if (response.ok) {
      const data = await response.json();
      currentUsers = data.users;
      renderUserList(currentUsers);
    } else {
      const data = await response.json();
      showAdminError(data.error || "Search failed");
    }
  } catch (err) {
    showAdminError("Something went wrong searching users");
  }
}

// ---------- RENDER USERS ----------
function renderUserList(users) {
  const tbody = getOrCreateTableBody("usersListContainer"); // reuses the helper from contacts.js
  if (!tbody) return;

  tbody.innerHTML = "";

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No users found.</td></tr>`;
    return;
  }

  users.forEach(function (user) {
    tbody.appendChild(renderUserRow(user));
  });
}

function renderUserRow(user) {
  const row = document.createElement("tr");
  const isDisabled = !!user.IsDisabled;
  const isAdmin = user.Role === "admin";
  const isSelf = String(user.UserID) === String(currentAdminId);

  row.innerHTML = `
    <td>
      <button type="button" class="admin-star-btn ${isAdmin ? "is-admin" : ""}" title="${isAdmin ? "Remove admin status" : "Make admin"}" ${isSelf ? "disabled" : ""}><i class="bi ${isAdmin ? "bi-star-fill" : "bi-star"}"></i></button>
      ${user.Username}<br><small class="admin-name-indent">${user.FirstName} ${user.LastName}</small></td>
    <td>${isAdmin ? "Yes" : "No"}</td>
    <td>${isDisabled ? "Disabled" : "Active"}</td>
    <td>
      <button type="button" class="btn btn-sm contacts-btn">Contacts</button>
      <button type="button" class="btn btn-sm btn-outline-secondary details-btn">Change Password</button>
      <button type="button" class="btn btn-sm toggle-user-btn ${isDisabled ? "enable-btn" : "disable-btn"}">${isDisabled ? "Enable" : "Disable"}</button>
    </td>
  `;

  row.querySelector(".admin-star-btn").addEventListener("click", function () {
    toggleUserAdmin(user.UserID, !isAdmin);
  });
  row.querySelector(".contacts-btn").addEventListener("click", function () {
    window.location.href = "admin-contacts.html?user_id=" + encodeURIComponent(user.UserID);
  });
  row.querySelector(".details-btn").addEventListener("click", function () {
    openChangePasswordModal(user.UserID);
  });
  row.querySelector(".toggle-user-btn").addEventListener("click", function () {
    toggleUserDisabled(user.UserID, !isDisabled);
  });

  return row;
}

// ---------- DISABLE / ENABLE USER ----------
async function toggleUserDisabled(userId, disable) {
  const confirmed = confirm(
    disable ? "Disable this user's account?" : "Re-enable this user's account?"
  );
  if (!confirmed) return;

  try {
    const response = await fetch(ADMIN_BASE + "admin_set_user_disabled.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: userId, is_disabled: disable }),
    });

    if (response.ok) {
      loadUsers();
    } else {
      const data = await response.json();
      showAdminError(data.error || "Failed to update user");
    }
  } catch (err) {
    showAdminError("Something went wrong updating this user");
  }
}

// ---------- PROMOTE / DEMOTE ADMIN ----------
async function toggleUserAdmin(userId, makeAdmin) {
  const confirmed = confirm(
    makeAdmin
      ? "Are you sure you wish to promote this user to Admin?"
      : "Are you sure you want to remove this user's Admin status?"
  );
  if (!confirmed) return;

  try {
    const response = await fetch(ADMIN_BASE + "admin_set_user_role.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: userId, is_admin: makeAdmin }),
    });

    if (response.ok) {
      loadUsers();
    } else {
      const data = await response.json();
      showAdminError(data.error || "Failed to update admin status");
    }
  } catch (err) {
    showAdminError("Something went wrong updating admin status");
  }
}

// ---------- CHANGE PASSWORD MODAL ----------
function openChangePasswordModal(userId) {
  selectedUserId = userId;
  clearChangePasswordError();
  document.getElementById("changePasswordForm").reset();

  const modal = document.getElementById("changePasswordModal");
  if (modal) modal.style.display = "block";
}

function closeChangePasswordModal() {
  const modal = document.getElementById("changePasswordModal");
  if (modal) modal.style.display = "none";
  selectedUserId = null;
}

async function submitChangePasswordForm(event) {
  event.preventDefault();

  const newPassword = document.getElementById("inputNewPassword").value.trim();
  clearChangePasswordError();

  if (newPassword.length < 8) {
    showChangePasswordError("Password must be at least 8 characters");
    return;
  }

  try {
    const response = await fetch(ADMIN_BASE + "admin_change_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: selectedUserId, new_password: newPassword }),
    });

    if (response.ok) {
      closeChangePasswordModal();
    } else {
      const data = await response.json();
      showChangePasswordError(data.error || "Failed to update password");
    }
  } catch (err) {
    showChangePasswordError("Something went wrong updating the password");
  }
}

// ---------- CREATE ADMIN MODAL ----------
function openAdminModal() {
  document.getElementById("adminForm").reset();
  clearAdminError();

  const modal = document.getElementById("adminModal");
  if (modal) modal.style.display = "block";
}

function closeAdminModal() {
  const modal = document.getElementById("adminModal");
  if (modal) modal.style.display = "none";
}

async function submitAdminForm(event) {
  event.preventDefault();

  const data = {
    first_name: document.getElementById("newAdminFirstName").value.trim(),
    last_name: document.getElementById("newAdminLastName").value.trim(),
    email: document.getElementById("newAdminEmail").value.trim(),
    username: document.getElementById("newAdminUsername").value.trim(),
    password: document.getElementById("newAdminPassword").value.trim(),
  };

  clearAdminError();

  if (!data.first_name || !data.last_name || !data.email || !data.username || !data.password) {
    showAdminError("All fields are required");
    return;
  }

  try {
    const response = await fetch(ADMIN_BASE + "admin_create_admin.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (response.ok) {
      closeAdminModal();
      loadUsers();
    } else {
      const result = await response.json();
      showAdminError(result.error || "Failed to create admin account");
    }
  } catch (err) {
    showAdminError("Something went wrong creating this admin account");
  }
}

// ---------- LOAD A USER'S CONTACTS (admin view) ----------
function getViewedUserId() {
  return new URLSearchParams(window.location.search).get("user_id");
}

async function loadAllContacts(query = "") {
  const userId = getViewedUserId();
  if (!userId) {
    window.location.href = "admin-user-management.html";
    return;
  }

  let url = ADMIN_BASE + "admin_contacts.php?user_id=" + encodeURIComponent(userId);
  if (query) url += "&search=" + encodeURIComponent(query);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      currentContacts = data.contacts; // shared with contacts.js so Edit/Delete keep working
      renderContactList(currentContacts);

      const title = document.getElementById("contactsPageTitle");
      if (title && data.owner) {
        title.textContent = data.owner.FirstName + " " + data.owner.LastName + "'s Contacts";
      }
    } else {
      const data = await response.json();
      showContactError(data.error || "Failed to load contacts");
    }
  } catch (err) {
    showContactError("Something went wrong loading contacts");
  }
}

// ---------- PAGE SETUP ----------
document.addEventListener("DOMContentLoaded", async function () {
  const page = document.body.dataset.page;

  const usersBtn = document.getElementById("usersBtn");
  if (usersBtn) {
    usersBtn.addEventListener("click", function () {
      window.location.href = "admin-user-management.html";
    });
  }

  const backToUsersBtn = document.getElementById("backToUsersBtn");
  if (backToUsersBtn) {
    backToUsersBtn.addEventListener("click", function () {
      window.location.href = "admin-user-management.html";
    });
  }

  const backToHomeBtn = document.getElementById("backToHomeBtn");
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener("click", function () {
      window.location.href = "admin-dashboard.html";
    });
  }

  if (page !== "admin-users") return;

  const user = await checkAuth();
  if (!user) return;

  loadUsers();

  const adminForm = document.getElementById("adminForm");
  if (adminForm) adminForm.addEventListener("submit", submitAdminForm);

  const cancelAdminBtn = document.getElementById("cancelAdminBtn");
  if (cancelAdminBtn) cancelAdminBtn.addEventListener("click", closeAdminModal);

  const createAdminBtn = document.getElementById("addContactBtn");
  if (createAdminBtn) createAdminBtn.addEventListener("click", openAdminModal);

  const changePasswordForm = document.getElementById("changePasswordForm");
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", submitChangePasswordForm);
  }

  const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");
  if (cancelPasswordBtn) cancelPasswordBtn.addEventListener("click", closeChangePasswordModal);

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchContactBtn");

  function runUserSearch() {
    searchUsers(searchInput ? searchInput.value.trim() : "");
  }

  if (searchInput) searchInput.addEventListener("input", runUserSearch);
  if (searchBtn) searchBtn.addEventListener("click", runUserSearch);
});