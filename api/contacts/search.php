<?php
//GET /contacts/search.php?q=searchterm
//GET /contacts/search.php?q=searchterm&all=1   (admins only: search across every user's contacts)
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

$session = require_login();
$pdo = get_db_connection();

$search = trim($_GET['q'] ?? '');
if ($search === '') {
    send_json(['error' => 'A search term (q) is required'], 400);
}
$like = "%$search%";

if ($session['role'] === 'admin' && ($_GET['all'] ?? '') === '1') {
    $stmt = $pdo->prepare(
        'SELECT * FROM Contacts
         WHERE FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ?
         ORDER BY LastName, FirstName'
    );
    $stmt->execute([$like, $like, $like]);
} else {
    $stmt = $pdo->prepare(
        'SELECT * FROM Contacts
         WHERE UserID = ? AND (FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ?)
         ORDER BY LastName, FirstName'
    );
    $stmt->execute([$session['user_id'], $like, $like, $like]);
}

send_json($stmt->fetchAll());
