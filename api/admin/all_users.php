<?php
//GET /admin/all_users.php
//GET /admin/all_users.php?q=searchterm
//lists every user in the system (never returns PasswordHash)
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

require_admin();
$pdo = get_db_connection();

$search = trim($_GET['q'] ?? '');

if ($search !== '') {
    $like = "%$search%";
    $stmt = $pdo->prepare(
        'SELECT ID, FirstName, LastName, Username, Email, Role, IsDisabled, CreatedAt, UpdatedAt
         FROM Users
         WHERE FirstName LIKE ? OR LastName LIKE ? OR Username LIKE ? OR Email LIKE ?
         ORDER BY LastName, FirstName'
    );
    $stmt->execute([$like, $like, $like, $like]);
} else {
    $stmt = $pdo->query(
        'SELECT ID, FirstName, LastName, Username, Email, Role, IsDisabled, CreatedAt, UpdatedAt
         FROM Users ORDER BY LastName, FirstName'
    );
}

send_json($stmt->fetchAll());
