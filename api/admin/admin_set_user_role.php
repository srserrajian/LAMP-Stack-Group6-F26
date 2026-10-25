<?php
//POST /admin_set_user_role.php
//Body: { "user_id", "is_admin": true|false }
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

$session = require_admin();
$input = get_json_input();

$userId = (int) ($input['user_id'] ?? 0);
$role = !empty($input['is_admin']) ? 'admin' : 'user';

if (!$userId) {
    send_json(['error' => 'user_id is required'], 400);
}

//prevents an admin from locking themselves (and possibly everyone) out
if ($userId === (int) $session['user_id']) {
    send_json(['error' => 'You cannot change your own admin status'], 400);
}

$pdo = get_db_connection();

$stmt = $pdo->prepare('SELECT UserID FROM Users WHERE UserID = ?');
$stmt->execute([$userId]);
if (!$stmt->fetch()) {
    send_json(['error' => 'User not found'], 404);
}

$stmt = $pdo->prepare('UPDATE Users SET Role = ? WHERE UserID = ?');
$stmt->execute([$role, $userId]);

send_json(['message' => $role === 'admin' ? 'User promoted to admin' : 'Admin status removed']);
