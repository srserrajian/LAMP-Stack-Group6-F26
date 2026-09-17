<?php
//config.php

define('DB_HOST', 'localhost');
define('DB_NAME', 'ContactManagerDB');
define('DB_USER', 'ContactManagerApp');
define('DB_PASS', 'CHANGE_ME');

function get_db_connection(): PDO {
    try {
        return new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false, // real prepared statements
            ]
        );
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
}
