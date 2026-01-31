<?php
header('Content-Type: application/json');

$result = [
  'ok' => true,
  'ADMIN_PASSWORD_HASH_getenv' => getenv('ADMIN_PASSWORD_HASH') ?: null,
  'ADMIN_PASSWORD_HASH_env' => isset($_ENV['ADMIN_PASSWORD_HASH']) ? $_ENV['ADMIN_PASSWORD_HASH'] : null,
  'ADMIN_PASSWORD_HASH_server' => isset($_SERVER['ADMIN_PASSWORD_HASH']) ? $_SERVER['ADMIN_PASSWORD_HASH'] : null,
  'config_exists' => false,
  'config_included' => false,
  'config_sets_hash' => false,
];

$cfg = __DIR__ . '/config.php';
if (file_exists($cfg)) {
  $result['config_exists'] = true;
  // include but avoid exposing the hash value; just check whether it defines the expected variable
  try {
    include $cfg; // should set $ADMIN_PASSWORD_HASH
    $result['config_included'] = true;
    if (!empty($ADMIN_PASSWORD_HASH)) {
      $result['config_sets_hash'] = true;
    }
  } catch (Exception $e) {
    $result['config_included'] = false;
  }
}

echo json_encode($result);

// Note: remove this file after debugging to avoid exposing configuration state.
