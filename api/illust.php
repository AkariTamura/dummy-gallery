<?php
declare(strict_types=1);

// -------------------------
// CORS 設定（開発中のみ Vite dev server からのアクセス許可）
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

$basePrefix = (strpos($_SERVER['REQUEST_URI'], '/dummy/') !== false) ? '/dummy' : '';

$mode = $_GET['mode'] ?? $_GET['action'] ?? null;
if ($mode && $path === 'api/illust.php') {
    if ($mode === 'detail' && isset($_GET['id'])) {
        $path = 'api/illust.php/detail/' . (int)$_GET['id'];
    } else {
        $path = 'api/illust.php/' . $mode;
    }
}

// -------------------------
// DB 接続
// -------------------------
try {
    $db = new PDO('sqlite:' . __DIR__ . '/../db/illustDB');
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
// 一覧取得 API
// =========================
if ($path === 'api/illust.php/list') {
    $stmt = $db->query(
        "SELECT id, title, tags, hide_flg
         FROM illust
         ORDER BY id DESC"
    );

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$r) {
        $r['tags'] = json_decode($r['tags'], true) ?? [];
        $r['image'] = "{$basePrefix}/assets/img/illust/thumb/{$r['id']}.jpg";
        $r['hide_flg'] = (bool)$r['hide_flg'];
    }

    jsonResponse($rows);
}

// =========================
// 詳細取得 API
// =========================
if (preg_match('#^api/illust\.php/detail/(\d+)$#', $path, $m)) {
    $stmt = $db->prepare("SELECT * FROM illust WHERE id = ?");
    $stmt->execute([(int)$m[1]]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        jsonResponse(['error' => 'not found'], 404);
    }

    $row['tags'] = json_decode($row['tags'], true) ?? [];
    $row['image'] = "{$basePrefix}/assets/img/illust/{$row['id']}.{$row['ext']}";
    $row['hide_flg'] = (bool)$row['hide_flg'];

    jsonResponse($row);
}

// =========================
// 該当 API がない場合は 404
// =========================
jsonResponse(['error' => 'invalid endpoint'], 404);
