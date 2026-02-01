<?php
// セッション cookie を厳格化
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    // omit 'domain' to keep a host-only cookie so the dev proxy (Vite) works correctly
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();
header('Content-Type: application/json');

// 開発環境のみ任意のオリジンを許可する（Vite での開発時）
$appEnv = getenv('APP_ENV') ?: getenv('APPLICATION_ENV');
if ($appEnv === 'development' || $appEnv === 'local') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
    header('Access-Control-Allow-Origin: ' . $origin);
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
$PASSWORD_HASH = getenv('ADMIN_PASSWORD_HASH');

// 読み込めなければ同ディレクトリの設定ファイルを参照する
if (!$PASSWORD_HASH) {
    $cfg = __DIR__ . '/config.php';
    if (file_exists($cfg)) {
        // 安全のため include 直後に変数を確認する
        include $cfg; // should set $ADMIN_PASSWORD_HASH
        if (!empty($ADMIN_PASSWORD_HASH)) {
            $PASSWORD_HASH = $ADMIN_PASSWORD_HASH;
        }
    }
}
if (!$PASSWORD_HASH) {
    // 環境変数 APP_ENV が development または local の場合のみ許可
    $appEnv = getenv('APP_ENV') ?: getenv('APPLICATION_ENV');
    if ($appEnv === 'development' || $appEnv === 'local') {
        // 開発用ダミーハッシュ
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

    // ハッシュが空の場合は外部で審査済みのためここでは失敗扱い
    if ($PASSWORD_HASH && password_verify($password, $PASSWORD_HASH)) {
        // セッション固定攻撃対策
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'authentication failed']);
    }
    exit;
}

// ===== ログアウト処理API =====
if ($method === 'POST' && $action === 'logout') {
    // セッション削除とクッキー破棄
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

// ===== ログイン状態チェックAPI =====
if ($action === 'check') {
    echo json_encode([
        'ok' => !empty($_SESSION['admin']) && $_SESSION['admin'] === true
    ]);
    exit;
}

// ===== 不正アクセス =====
http_response_code(400);
echo json_encode(['ok' => false, 'message' => 'bad request']);