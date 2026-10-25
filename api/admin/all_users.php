<?php

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['error' => 'Method not allowed'], 405);
}

$session = require_admin();
$currentUserId = (int) $session['user_id'];

$pdo = get_db_connection();

$search = trim($_GET['search'] ?? '');

if ($search === '') {
    $stmt = $pdo->prepare(
        'SELECT
            UserID,
            FirstName,
            LastName,
            Username,
            Email,
            Role,
            IsDisabled,
            CreatedAt,
            UpdatedAt
         FROM Users
         WHERE UserID <> ?
         ORDER BY LastName, FirstName'
    );

    $stmt->execute([$currentUserId]);
} else {
    $like = '%' . $search . '%';

    $stmt = $pdo->prepare(
        'SELECT
            UserID,
            FirstName,
            LastName,
            Username,
            Email,
            Role,
            IsDisabled,
            CreatedAt,
            UpdatedAt
         FROM Users
         WHERE UserID <> ?
           AND (FirstName LIKE ?
            OR LastName LIKE ?
            OR Username LIKE ?
            OR Email LIKE ?)
         ORDER BY LastName, FirstName'
    );

    $stmt->execute([$currentUserId, $like, $like, $like, $like]);
}

send_json([
    'users' => $stmt->fetchAll()
]);