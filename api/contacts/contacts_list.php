<?php
//GET /contacts_list.php?q=searchterm
//GET /contacts_list.php?q=searchterm&all=1   (admins only: search across all users)
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/helpers.php';

$session = require_login();
$pdo = get_db_connection();

$search = trim($_GET['q'] ?? '');
$like = "%$search%";

if ($session['role'] === 'admin' && ($_GET['all'] ?? '') === '1') {
    //admin view: contacts across every user
    if ($search !== '') {
        $stmt = $pdo->prepare(
            'SELECT * FROM Contacts
             WHERE FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ?
             ORDER BY LastName, FirstName'
        );
        $stmt->execute([$like, $like, $like]);
    } else {
        $stmt = $pdo->query('SELECT * FROM Contacts ORDER BY LastName, FirstName');
    }
} else {
    //normal view: only the logged-in user's own contacts
    if ($search !== '') {
        $stmt = $pdo->prepare(
            'SELECT * FROM Contacts
             WHERE UserID = ? AND (FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ?)
             ORDER BY LastName, FirstName'
        );
        $stmt->execute([$session['user_id'], $like, $like, $like]);
    } else {
        $stmt = $pdo->prepare('SELECT * FROM Contacts WHERE UserID = ? ORDER BY LastName, FirstName');
        $stmt->execute([$session['user_id']]);
    }
}

send_json($stmt->fetchAll());
