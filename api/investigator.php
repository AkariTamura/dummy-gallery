<?php
session_start();
header('Content-Type: application/json');

// -------------------------
// CORS 設定（開発中のみ）
// -------------------------
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
}

// OPTIONS リクエストは即終了
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -------------------------
// リクエストパス取得
// -------------------------
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/dummy/#', '', $path); // /dummy/ を削除
$path = trim($path, '/');                   // 前後のスラッシュ削除

$mode = $_GET['mode'] ?? $_GET['action'] ?? null;
if ($mode && $path === 'api/investigator.php') {
    $path = 'api/investigator.php/' . $mode;
}

// -------------------------
// DB 接続
// -------------------------
try {
    $db = new PDO('sqlite:' . __DIR__ . '/../db/investigatorsDB');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB接続エラー']);
    exit;
}

// -------------------------
// JSON レスポンス ヘルパー
// -------------------------
function jsonResponse($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// =========================
// 探索者一覧取得API
// =========================
if ($path === 'api/investigator.php/investigator_list') {

    $stmt = $db->query(
        "SELECT *
         FROM investigators
         ORDER BY id DESC"
    );

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse($rows);
}

// =========================
// 探索者詳細取得API
// =========================
if ($path === 'api/investigator.php/investigator_detail') {

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'id missing']);
        exit;
    }

    try {
        $stmt = $db->prepare('SELECT * FROM investigators WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'not found']);
            exit;
        }
        jsonResponse($row);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}

// =========================
// 探索者画像取得API
// =========================
if ($path === 'api/investigator.php/investigator_image') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo 'id missing';
        exit;
    }

    $baseDir = dirname(__DIR__) . '/assets/img/investigator';
    $files = glob($baseDir . "/{$id}.*");
    if (!$files) {
        http_response_code(404);
        echo 'not found';
        exit;
    }

    $filePath = $files[0];
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mime = 'application/octet-stream';
    if ($ext === 'png') $mime = 'image/png';
    if ($ext === 'jpg' || $ext === 'jpeg') $mime = 'image/jpeg';
    if ($ext === 'gif') $mime = 'image/gif';

    header('Content-Type: ' . $mime);
    readfile($filePath);
    exit;
}