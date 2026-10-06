<?php

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['error' => 'Method not allowed'], 405);
}

require_admin();

$pdo = get_db_connection();

$search = trim($_GET['search'] ?? '');
$userId = (int) ($_GET['user_id'] ?? 0);

$owner = null;

if ($userId) {
    $stmt = $pdo->prepare(
        'SELECT UserID, Username, FirstName, LastName
         FROM Users
         WHERE UserID = ?'
    );
    $stmt->execute([$userId]);
    $owner = $stmt->fetch();

    if (!$owner) {
        send_json(['error' => 'User not found'], 404);
    }
}

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

$where = [];
$params = [];

if ($userId) {
    $where[] = 'c.UserID = ?';
    $params[] = $userId;
}

if ($search !== '') {
    $like = '%' . $search . '%';

    $fields = [
        'c.FirstName',
        'c.LastName',
        'c.Email',
        'c.Phone'
    ];

    // Owner fields are only searched when browsing across all users
    if (!$userId) {
        array_push($fields, 'u.Username', 'u.FirstName', 'u.LastName');
    }

    $conditions = [];
    foreach ($fields as $field) {
        $conditions[] = $field . ' LIKE ?';
        $params[] = $like;
    }

    $where[] = '(' . implode(' OR ', $conditions) . ')';
}

if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
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
    'owner' => $owner ?: null,
    'contacts' => $stmt->fetchAll()
]);