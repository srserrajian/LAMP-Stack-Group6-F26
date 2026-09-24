<?php

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['error' => 'Method not allowed'], 405);
}

require_admin();

$pdo = get_db_connection();

$search = trim($_GET['search'] ?? '');

$sql = '
    SELECT
        c.ContactID,
        c.UserID,

        u.Username AS OwnerUsername,
        u.FirstName AS OwnerFirstName,
        u.LastName AS OwnerLastName,

        c.FirstName,
        c.LastName,
        c.Email,
        c.Phone,
        c.Address,
        c.City,
        c.State,
        c.PostalCode,
        c.Notes,
        c.CreatedAt,
        c.UpdatedAt

    FROM Contacts c

    INNER JOIN Users u
        ON c.UserID = u.UserID
';

$params = [];

if ($search !== '') {
    $sql .= '
        WHERE c.FirstName LIKE ?
           OR c.LastName LIKE ?
           OR c.Email LIKE ?
           OR c.Phone LIKE ?
           OR u.Username LIKE ?
           OR u.FirstName LIKE ?
           OR u.LastName LIKE ?
    ';

    $like = '%' . $search . '%';

    $params = [
        $like,
        $like,
        $like,
        $like,
        $like,
        $like,
        $like
    ];
}

$sql .= '
    ORDER BY
        u.Username,
        c.LastName,
        c.FirstName
';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

send_json([
    'contacts' => $stmt->fetchAll()
]);