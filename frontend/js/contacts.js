// ---------- STATE ----------
let currentContacts = [];
let modalMode = "add"; // "add" or "edit"
let selectedContactId = null;

// ---------- ERROR HELPER ----------
function showContactError(message) {
  const el = document.getElementById("contactError");
  if (el) {
    el.textContent = message;
    el.classList.remove("d-none");
  }
}

function clearContactError() {
  const el = document.getElementById("contactError");
  if (el) {
    el.textContent = "";
    el.classList.add("d-none");
  }
}

function getContactId(contact) {
  return contact.ID !== undefined ? contact.ID : contact.ContactID;
}

function getOrCreateTableBody(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const table = container.querySelector("table");
  if (!table) return null;

  const headerRow = table.querySelector("thead tr");
  if (headerRow && !headerRow.querySelector(".actions-header")) {
    const th = document.createElement("th");
    th.textContent = "Actions";
    th.className = "actions-header";
    headerRow.appendChild(th);
  }

  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  return tbody;
}

// ---------- INJECT MODAL IF MISSING ----------
function ensureContactModalExists() {
  if (document.getElementById("contactModal")) return;

  const modalHTML = `
    <div id="contactModal" style="display: none;">
      <div class="modal-content">
        <h5 id="contactModalTitle">Add Contact</h5>
        <form id="contactForm">
          <p id="contactError" class="text-danger small d-none"></p>

          <label for="firstName">First Name</label>
          <input type="text" id="firstName" class="form-control" required>

          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" class="form-control" required>

          <label for="email">Email</label>
          <input type="email" id="email" class="form-control">

          <label for="phone">Phone</label>
          <input type="text" id="phone" class="form-control">

          <label for="address">Address</label>
          <input type="text" id="address" class="form-control">

          <label for="city">City</label>
          <input type="text" id="city" class="form-control">

          <label for="state">State</label>
          <input type="text" id="state" class="form-control">

          <label for="postalCode">Postal Code</label>
          <input type="text" id="postalCode" class="form-control">

          <label for="notes">Notes</label>
          <textarea id="notes" class="form-control"></textarea>

          <button type="button" onclick="closeContactModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  document.getElementById("contactForm").addEventListener("submit", submitContactForm);
}

// ---------- LOAD ALL ----------
async function loadContacts() {
  try {
    const response = await fetch(CONTACTS_BASE + "contacts_list.php", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      currentContacts = await response.json();
      renderContactList(currentContacts);
    } else {
      const data = await response.json();
      showContactError(data.error || "Failed to load contacts");
    }
  } catch (err) {
    showContactError("Something went wrong loading contacts");
  }
}

// ---------- SEARCH ----------
async function searchContacts(query) {
  if (!query) {
    loadContacts();
    return;
  }

  try {
    const response = await fetch(
      CONTACTS_BASE + "contacts_list.php?q=" + encodeURIComponent(query),
      { method: "GET", credentials: "include" }
    );

    if (response.ok) {
      currentContacts = await response.json();
      renderContactList(currentContacts);
    } else {
      const data = await response.json();
      showContactError(data.error || "Search failed");
    }
  } catch (err) {
    showContactError("Something went wrong searching contacts");
  }
}

// ---------- ADD / EDIT MODAL ----------
function openAddModal() {
  document.getElementById("contactForm").reset();
  document.getElementById("contactModalTitle").textContent = "Add Contact";
  modalMode = "add";
  selectedContactId = null;
  clearContactError();

  const modal = document.getElementById("contactModal");
  if (modal) modal.style.display = "block";
}

function openEditModal(contactId) {
  const contact = currentContacts.find(function (c) {
    return getContactId(c) === contactId;
  });
  if (!contact) return;

  document.getElementById("firstName").value = contact.FirstName || "";
  document.getElementById("lastName").value = contact.LastName || "";
  document.getElementById("email").value = contact.Email || "";
  document.getElementById("phone").value = contact.Phone || "";
  document.getElementById("address").value = contact.Address || "";
  document.getElementById("city").value = contact.City || "";
  document.getElementById("state").value = contact.State || "";
  document.getElementById("postalCode").value = contact.PostalCode || "";
  document.getElementById("notes").value = contact.Notes || "";

  document.getElementById("contactModalTitle").textContent = "Edit Contact";
  modalMode = "edit";
  selectedContactId = contactId;
  clearContactError();

  const modal = document.getElementById("contactModal");
  if (modal) modal.style.display = "block";
}

function closeContactModal() {
  const modal = document.getElementById("contactModal");
  if (modal) modal.style.display = "none";
}

async function submitContactForm(event) {
  event.preventDefault();

  const data = {
    first_name: document.getElementById("firstName").value.trim(),
    last_name: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim(),
    postal_code: document.getElementById("postalCode").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };

  if (!data.first_name || !data.last_name) {
    showContactError("First and last name are required");
    return;
  }

  try {
    let response;

    if (modalMode === "add") {
      response = await fetch(CONTACTS_BASE + "contacts_create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
    } else {
      data.id = selectedContactId;
      response = await fetch(CONTACTS_BASE + "contacts_update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
    }

    if (response.ok) {
      closeContactModal();
      reloadCurrentView();
    } else {
      const result = await response.json();
      showContactError(result.error || "Failed to save contact");
    }
  } catch (err) {
    showContactError("Something went wrong saving this contact");
  }
}

// ---------- DELETE ----------
async function deleteContact(contactId) {
  const confirmed = confirm("Are you sure you want to delete this contact?");
  if (!confirmed) return;

  try {
    const response = await fetch(CONTACTS_BASE + "contacts_delete.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: contactId }),
    });

    if (response.ok) {
      reloadCurrentView();
    } else {
      const data = await response.json();
      showContactError(data.error || "Failed to delete contact");
    }
  } catch (err) {
    showContactError("Something went wrong deleting this contact");
  }
}

function reloadCurrentView() {
  if (typeof loadAllContacts === "function" && isAdminContactsPage()) {
    loadAllContacts();
  } else {
    loadContacts();
  }
}

function isAdminContactsPage() {
  return typeof loadUsers === "function" && !document.getElementById("userListContainer");
}

// ---------- RENDER ----------
function renderContactList(contacts) {
  const tbody = getOrCreateTableBody("contactListContainer");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (contacts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No contacts found.</td></tr>`;
    return;
  }

  contacts.forEach(function (contact) {
    tbody.appendChild(renderContactRow(contact));
  });
}

function renderContactRow(contact) {
  const contactId = getContactId(contact);
  const row = document.createElement("tr");

  const ownerLine = contact.OwnerUsername
    ? `<br><small>owner: ${contact.OwnerUsername}</small>`
    : "";

  row.innerHTML = `
    <td>${contact.FirstName} ${contact.LastName}${ownerLine}</td>
    <td>${contact.Phone || ""}</td>
    <td>${contact.Email || ""}</td>
    <td>${contact.PostalCode || ""}</td>
    <td>
      <button type="button" class="btn btn-sm btn-outline-secondary edit-btn">Edit</button>
      <button type="button" class="btn btn-sm btn-outline-danger delete-btn">Delete</button>
    </td>
  `;

  row.querySelector(".edit-btn").addEventListener("click", function () {
    openEditModal(contactId);
  });
  row.querySelector(".delete-btn").addEventListener("click", function () {
    deleteContact(contactId);
  });

  return row;
}

// ---------- PAGE SETUP ----------
document.addEventListener("DOMContentLoaded", async function () {
  const user = await checkAuth();
  if (!user) return;

  const container = document.getElementById("contactListContainer");
  if (!container) return;

  ensureContactModalExists();
  reloadCurrentView();

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchContactBtn");

  function runSearch() {
    const query = searchInput ? searchInput.value.trim() : "";
    if (typeof loadAllContacts === "function" && isAdminContactsPage()) {
      loadAllContacts(query);
    } else {
      searchContacts(query);
    }
  }

  if (searchInput) searchInput.addEventListener("input", runSearch);
  if (searchBtn) searchBtn.addEventListener("click", runSearch);

  const addBtn = document.getElementById("addContactBtn");
  if (addBtn) {
    addBtn.addEventListener("click", openAddModal);
  }
});