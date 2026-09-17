<?php
//POST /logout.php
require_once __DIR__ . '/../config/helpers.php';

start_api_session();
$_SESSION = [];
session_destroy();

send_json(['message' => 'Logged out']);
