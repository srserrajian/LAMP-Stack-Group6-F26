<?php
//POST /login.php
//Body: { "username", "password" }   (username can be username OR email)
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

$input = get_json_input();
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$password) {
    send_json(['error' => 'Username and password are required'], 400);
}

$pdo = get_db_connection();
$stmt = $pdo->prepare('SELECT * FROM Users WHERE Username = ? OR Email = ?');
$stmt->execute([$username, $username]);
$user = $stmt->fetch();

//generic error whether the user doesn't exist or the password is wrong —
//don't say which one it was
if (!$user || !password_verify($password, $user['PasswordHash'])) {
    send_json(['error' => 'Invalid username or password'], 401);
}

if ($user['IsDisabled']) {
    send_json(['error' => 'This account has been disabled'], 403);
}

start_api_session();
session_regenerate_id(true); //prevent session fixation
$_SESSION['user_id']  = $user['ID'];
$_SESSION['username'] = $user['Username'];
$_SESSION['role']     = $user['Role'];

send_json([
    'message' => 'Login successful',
    'user' => [
        'id'         => $user['ID'],
        'first_name' => $user['FirstName'],
        'last_name'  => $user['LastName'],
        'username'   => $user['Username'],
        'email'      => $user['Email'],
        'role'       => $user['Role'],
    ],
]);
