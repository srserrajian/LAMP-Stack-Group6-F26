<?php

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['error' => 'Method not allowed'], 405);
}

require_admin();

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
         ORDER BY LastName, FirstName'
    );

    $stmt->execute();
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
         WHERE FirstName LIKE ?
            OR LastName LIKE ?
            OR Username LIKE ?
            OR Email LIKE ?
         ORDER BY LastName, FirstName'
    );

    $stmt->execute([$like, $like, $like, $like]);
}

send_json([
    'users' => $stmt->fetchAll()
]);