<?php
try {
    echo "Connecting to MySQL on 127.0.0.1...\n";
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=saukiglobal;charset=utf8mb4", "root", "", [
        PDO::ATTR_TIMEOUT => 3,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "Connected successfully!\n";
    
    echo "=== Schema for 'subscribers' ===\n";
    $stmt = $pdo->query("DESCRIBE subscribers");
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo "{$row['Field']} - {$row['Type']} - Null: {$row['Null']} - Key: {$row['Key']} - Default: {$row['Default']}\n";
    }

    echo "\n=== Check existing transaction_pin entries ===\n";
    $stmt = $pdo->query("SELECT sEmail, sFname, sPhone, sWallet, transaction_pin FROM subscribers ORDER BY sId DESC LIMIT 5");
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo "Email: {$row['sEmail']} | Name: {$row['sFname']} | Phone: {$row['sPhone']} | Wallet: {$row['sWallet']} | PIN: " . (empty($row['transaction_pin']) ? 'empty' : 'set') . "\n";
    }
} catch (PDOException $e) {
    echo "Connection error: " . $e->getMessage() . "\n";
}
