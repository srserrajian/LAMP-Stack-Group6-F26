<?php
//POST /admin_set_user_disabled.php
//Body: { "user_id", "is_disabled": true|false }
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

require_admin();
$input = get_json_input();

$userId = (int) ($input['user_id'] ?? 0);
$isDisabled = !empty($input['is_disabled']) ? 1 : 0;

if (!$userId) {
    send_json(['error' => 'user_id is required'], 400);
}

$pdo = get_db_connection();
$stmt = $pdo->prepare('UPDATE Users SET IsDisabled = ? WHERE UserID = ?');
$stmt->execute([$isDisabled, $userId]);

send_json(['message' => $isDisabled ? 'User disabled' : 'User enabled']);
