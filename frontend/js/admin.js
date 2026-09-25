// ---------- STATE ----------
let currentUsers = [];
let selectedUserId = null; // tracks which user the password modal is acting on

// ---------- ERROR HELPER (same pattern as auth.js/contacts.js) ----------
function showAdminError(message) {
  const el = document.getElementById("adminError");
  if (el) {
    el.textContent = message;
  }
}

function clearAdminError() {
  showAdminError("");
}

// ---------- LOAD ALL USERS (updated) ----------
async function loadUsers() {
  try {
    const response = await fetch(ADMIN_BASE + "all_users.php", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      currentUsers = data.users; // now wrapped, not a bare array
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

// ---------- SEARCH USERS (updated: q -> search) ----------
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

// ---------- NEW: LOAD ALL CONTACTS (admin view, with owner info) ----------
// filename below is a guess ("admin/all_contacts.php") — confirm with Morgan
let currentAllContacts = [];

async function loadAllContacts(query = "") {
  const url = query
    ? ADMIN_BASE + "admin_contacts.php?search=" + encodeURIComponent(query)
    : ADMIN_BASE + "admin_contacts.php";

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      currentAllContacts = data.contacts;
      renderAllContactsList(currentAllContacts);
    } else {
      const data = await response.json();
      showAdminError(data.error || "Failed to load contacts");
    }
  } catch (err) {
    showAdminError("Something went wrong loading contacts");
  }
}

function renderAllContactsList(contacts) {
  const container = document.getElementById("allContactsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (contacts.length === 0) {
    container.innerHTML = "<p>No contacts found.</p>";
    return;
  }

  contacts.forEach(function (contact) {
    const row = document.createElement("div");
    row.className = "contact-row";
    row.innerHTML = `
      <span>${contact.FirstName} ${contact.LastName}</span>
      <span>${contact.Email || ""}</span>
      <span>${contact.Phone || ""}</span>
      <span>Owner: ${contact.OwnerFirstName} ${contact.OwnerLastName} (${contact.OwnerUsername})</span>
    `;
    container.appendChild(row);
  });
}