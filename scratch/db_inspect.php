<?php
// db_inspect.php
define('BYPASS_DB_DIE', true);
require_once 'C:/xampp/htdocs/saukiglobal/config/next-config.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo "Failed to connect to database\n";
    exit(1);
}

echo "=== Schema for 'subscribers' ===\n";
$stmt = $pdo->query("DESCRIBE subscribers");
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    echo "{$row['Field']} - {$row['Type']} - Null: {$row['Null']} - Key: {$row['Key']} - Default: {$row['Default']}\n";
}

echo "\n=== Check existing transaction_pin entries ===\n";
$stmt = $pdo->query("SELECT sEmail, user_id, transaction_pin, pin_attempts, pin_locked_until FROM subscribers ORDER BY sId DESC LIMIT 5");
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    echo "Email: {$row['sEmail']} | User ID: {$row['user_id']} | PIN: {$row['transaction_pin']} | Attempts: {$row['pin_attempts']} | Locked Until: {$row['pin_locked_until']}\n";
}
