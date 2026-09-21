<?php
//GET /auth/current.php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

$session = require_login();
$pdo = get_db_connection();

//look up info instead of trusting the session blindly
$stmt = $pdo->prepare('SELECT UserID, FirstName, LastName, Username, Email, Role, IsDisabled FROM Users WHERE ID = ?');
$stmt->execute([$session['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    send_json(['error' => 'User not found'], 404);
}

if ($user['IsDisabled']) {
    //their account was disabled since they logged in — kill the session.
    session_unset();
    session_destroy();
    send_json(['error' => 'This account has been disabled'], 403);
}

send_json([
    'id'         => $user['UserID'],
    'first_name' => $user['FirstName'],
    'last_name'  => $user['LastName'],
    'username'   => $user['Username'],
    'email'      => $user['Email'],
    'role'       => $user['Role'],
]);
