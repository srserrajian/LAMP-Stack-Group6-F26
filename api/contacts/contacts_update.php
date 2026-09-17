<?php
//POST /contacts_update.php
//Body: { "id", "first_name", "last_name", "email", "phone", "address",
//        "city", "state", "postal_code", "notes" }
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

//confirm the contact exists and belongs to this user (admins can edit anyone's).
$stmt = $pdo->prepare('SELECT * FROM Contacts WHERE ID = ?');
$stmt->execute([$id]);
$contact = $stmt->fetch();

if (!$contact) {
    send_json(['error' => 'Contact not found'], 404);
}
if ($session['role'] !== 'admin' && $contact['UserID'] != $session['user_id']) {
    send_json(['error' => 'You do not have access to this contact'], 403);
}

$firstName = trim($input['first_name'] ?? $contact['FirstName']);
$lastName  = trim($input['last_name'] ?? $contact['LastName']);

if (!$firstName || !$lastName) {
    send_json(['error' => 'First and last name are required'], 400);
}

$stmt = $pdo->prepare(
    'UPDATE Contacts SET
        FirstName = ?, LastName = ?, Email = ?, Phone = ?,
        Address = ?, City = ?, State = ?, PostalCode = ?, Notes = ?
     WHERE ID = ?'
);
$stmt->execute([
    $firstName,
    $lastName,
    $input['email'] ?? $contact['Email'],
    $input['phone'] ?? $contact['Phone'],
    $input['address'] ?? $contact['Address'],
    $input['city'] ?? $contact['City'],
    $input['state'] ?? $contact['State'],
    $input['postal_code'] ?? $contact['PostalCode'],
    $input['notes'] ?? $contact['Notes'],
    $id,
]);

send_json(['message' => 'Contact updated']);
