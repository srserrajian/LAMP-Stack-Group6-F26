<?php

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/helpers.php';

$pdo = get_db_connection();

send_json([
    'status' => 'OK',
    'database' => $pdo->query('SELECT DATABASE()')->fetchColumn()
]);