<?php
//POST /admin_change_password.php
//Body: { "user_id", "new_password" }
require_once __DIR__ '/.../config/config.php';
require_once __DIR__ '/.../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

require_admin();
$input = get_json_input();

$userId = (int) ($input['user_id'] ?? 0);
$newPassword = $input['new_password'] ?? '';

if (!$userId || strlen($newPassword) < 8) {
    send_json(['error' => 'user_id and a new_password of at least 8 characters are required'], 400);
}

$pdo = get_db_connection();
$hash = password_hash($newPassword, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('UPDATE Users SET PasswordHash = ? WHERE ID = ?');
$stmt->execute([$hash, $userId]);

send_json(['message' => 'Password updated']);
