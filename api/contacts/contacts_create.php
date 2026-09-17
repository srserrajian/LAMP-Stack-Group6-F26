<?php
//POST /contacts_create.php
//Body: { "first_name", "last_name", "email", "phone", "address",
//        "city", "state", "postal_code", "notes" }
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

$session = require_login();
$input = get_json_input();

$firstName = trim($input['first_name'] ?? '');
$lastName  = trim($input['last_name'] ?? '');

if (!$firstName || !$lastName) {
    send_json(['error' => 'First and last name are required'], 400);
}

$pdo = get_db_connection();
$stmt = $pdo->prepare(
    'INSERT INTO Contacts
     (UserID, FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([
    $session['user_id'],
    $firstName,
    $lastName,
    $input['email'] ?? null,
    $input['phone'] ?? null,
    $input['address'] ?? null,
    $input['city'] ?? null,
    $input['state'] ?? null,
    $input['postal_code'] ?? null,
    $input['notes'] ?? null,
]);

send_json(['message' => 'Contact created', 'id' => (int) $pdo->lastInsertId()], 201);
