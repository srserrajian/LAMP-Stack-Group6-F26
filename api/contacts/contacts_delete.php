<?php
//POST /contacts_delete.php
//Body: { "id" }
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

$session = require_login();
$input = get_json_input();

$id = (int) ($input['id'] ?? 0);
if (!$id) {
    send_json(['error' => 'Contact id is required'], 400);
}

$pdo = get_db_connection();
$stmt = $pdo->prepare('SELECT UserID FROM Contacts WHERE ID = ?');
$stmt->execute([$id]);
$contact = $stmt->fetch();

if (!$contact) {
    send_json(['error' => 'Contact not found'], 404);
}
if ($session['role'] !== 'admin' && $contact['UserID'] != $session['user_id']) {
    send_json(['error' => 'You do not have access to this contact'], 403);
}

$stmt = $pdo->prepare('DELETE FROM Contacts WHERE ID = ?');
$stmt->execute([$id]);

send_json(['message' => 'Contact deleted']);
