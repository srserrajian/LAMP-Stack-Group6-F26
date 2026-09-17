<?php
//helpers.php
//shared helper functions

header('Content-Type: application/json');

//send JSON response and stop execution
function send_json($data, int $status_code = 200): void {
    http_response_code($status_code);
    echo json_encode($data);
    exit;
}

//read JSON request body into an associative array
function get_json_input(): array {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ?? [];
}

//start (or resume) the session with secure cookie settings
function start_api_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => true,     //cookie only sent over HTTPS
            'httponly' => true,   //not accessible to JS
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

//require that someone is logged in
//sends a 401 and exits if not
function require_login(): array {
    start_api_session();
    if (!isset($_SESSION['user_id'])) {
        send_json(['error' => 'Not authenticated'], 401);
    }
    return $_SESSION;
}

//require that the logged-in user is an admin
//sends 403 if not
function require_admin(): array {
    $session = require_login();
    if ($session['role'] !== 'admin') {
        send_json(['error' => 'Admin access required'], 403);
    }
    return $session;
}
