<?php
// POST /contacts_update.php
// Body: { "id", "first_name", "last_name", "email", "phone", "address",
//         "city", "state", "postal_code", "notes" }

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

/*
 * Retrieve the contact.
 *
 * Normal users may retrieve only contacts they own.
 * Admins may retrieve any contact.
 */
if ($session['role'] === 'admin') {
    $stmt = $pdo->prepare(
        'SELECT * FROM Contacts
         WHERE ContactID = ?'
    );
    $stmt->execute([$id]);
} else {
    $stmt = $pdo->prepare(
        'SELECT * FROM Contacts
         WHERE ContactID = ?
           AND UserID = ?'
    );
    $stmt->execute([
        $id,
        $session['user_id']
    ]);
}

$contact = $stmt->fetch();

if (!$contact) {
    send_json(['error' => 'Contact not found'], 404);
}

$firstName = trim($input['first_name'] ?? $contact['FirstName']);
$lastName  = trim($input['last_name'] ?? $contact['LastName']);

if (!$firstName || !$lastName) {
    send_json(
        ['error' => 'First and last name are required'],
        400
    );
}

/*
 * Update the contact.
 *
 * Ownership is enforced again in the UPDATE itself for
 * normal users.
 */
if ($session['role'] === 'admin') {

    $stmt = $pdo->prepare(
        'UPDATE Contacts SET
            FirstName = ?,
            LastName = ?,
            Email = ?,
            Phone = ?,
            Address = ?,
            City = ?,
            State = ?,
            PostalCode = ?,
            Notes = ?
         WHERE ContactID = ?'
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

} else {

    $stmt = $pdo->prepare(
        'UPDATE Contacts SET
            FirstName = ?,
            LastName = ?,
            Email = ?,
            Phone = ?,
            Address = ?,
            City = ?,
            State = ?,
            PostalCode = ?,
            Notes = ?
         WHERE ContactID = ?
           AND UserID = ?'
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
        $session['user_id'],
    ]);
}

send_json(['message' => 'Contact updated']);