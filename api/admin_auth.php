<?php
session_start();
header('Content-Type: application/json');

// 開発中のみ、Vite dev server からのアクセスを許可
if ($_SERVER['HTTP_ORIGIN'] ?? false) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
}

// OPTIONS リクエストへの対応（ブラウザが事前確認する場合）
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ===== 設定 =====
// パスワードハッシュは環境変数から読み込む
// 本番では必ず ADMIN_PASSWORD_HASH を設定してください
$PASSWORD_HASH = getenv('ADMIN_PASSWORD_HASH');
if (!$PASSWORD_HASH) {
    // 開発用フォールバック: 環境変数 APP_ENV が development または local の場合のみ許可
    $appEnv = getenv('APP_ENV') ?: getenv('APPLICATION_ENV');
    if ($appEnv === 'development' || $appEnv === 'local') {
        // 開発用ダミーハッシュ（必要なら変更してください）
        $PASSWORD_HASH = '$2y$10$NyoXz0Ro4FDSpC2kBcaF5ubR.BbMzfWGaqdyGUSDRGaMJOt8jFZqe';
    } else {
        // 本番で未設定の場合は安全のためエラーにする
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Server misconfiguration: ADMIN_PASSWORD_HASH is not set']);
        exit;
    }
}

// ===== リクエスト取得 =====
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'check';

// ===== ログイン処理API =====
if ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $password = $data['password'] ?? '';

    if (password_verify($password, $PASSWORD_HASH)) {
        $_SESSION['admin'] = true;
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['ok' => false, 'message' => 'login failed']);
    }
    exit;
}

// ===== ログアウト処理API =====
if ($method === 'POST' && $action === 'logout') {
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

// ===== ログイン状態チェックAPI =====
if ($action === 'check') {
    echo json_encode([
        'ok' => isset($_SESSION['admin']) && $_SESSION['admin'] === true
    ]);
    exit;
}

// ===== 不正アクセス =====
http_response_code(400);
echo json_encode(['ok' => false, 'message' => 'bad request']);