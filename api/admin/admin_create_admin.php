<?php

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

require_admin();

$input = get_json_input();

$firstName = trim($input['first_name'] ?? '');
$lastName  = trim($input['last_name'] ?? '');
$username  = trim($input['username'] ?? '');
$email     = trim($input['email'] ?? '');
$password  = $input['password'] ?? '';

if (!$firstName || !$lastName || !$username || !$email || !$password) {
    send_json(['error' => 'All fields are required'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['error' => 'Invalid email address'], 400);
}

if (strlen($password) < 8) {
    send_json(['error' => 'Password must be at least 8 characters'], 400);
}

$pdo = get_db_connection();

$stmt = $pdo->prepare(
    'SELECT UserID
     FROM Users
     WHERE Username = ? OR Email = ?'
);

$stmt->execute([$username, $email]);

if ($stmt->fetch()) {
    send_json(['error' => 'Username or email already in use'], 409);
}

$passwordHash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare(
    'INSERT INTO Users
        (FirstName, LastName, Username, Email, PasswordHash, Role, IsDisabled)
     VALUES
        (?, ?, ?, ?, ?, "admin", 0)'
);

$stmt->execute([
    $firstName,
    $lastName,
    $username,
    $email,
    $passwordHash
]);

$newUserId = (int) $pdo->lastInsertId();

send_json([
    'message' => 'Admin account created successfully',
    'user' => [
        'id' => $newUserId,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'username' => $username,
        'email' => $email,
        'role' => 'admin'
    ]
], 201);