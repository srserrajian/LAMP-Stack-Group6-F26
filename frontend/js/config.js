//CONSTANTS
const isLocal = window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";

const API_ROOT = isLocal
  ? "/api"
  : "https://contacts.morgangproject.xyz/api";

const AUTH_BASE = API_ROOT + "/auth/";
const CONTACTS_BASE = API_ROOT + "/contacts/";
const ADMIN_BASE = API_ROOT + "/admin/";