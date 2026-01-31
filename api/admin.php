<?php
session_start();
header('Content-Type: application/json');
// Toggle debug logging for admin endpoints
$ADMIN_DEBUG = false;

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

$basePrefix = '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (strpos($_SERVER['REQUEST_URI'], '/dummy/') !== false || strpos($referer, '/dummy/') !== false || strpos($origin, '/dummy/') !== false) {
    $basePrefix = '/dummy/';
}

$action = $_GET['action'] ?? $_GET['mode'] ?? null;
if ($action && $path === 'api/admin.php') {
    $path = 'api/admin.php/' . $action;
}

// -------------------------
// DB 接続
// -------------------------
try {
    $illustdb = new PDO('sqlite:' . __DIR__ . '/../db/illustDB');
    $illustdb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $investigatorsdb = new PDO('sqlite:' . __DIR__ . '/../db/investigatorsDB');
    $investigatorsdb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB接続エラー']);
    exit;
}

$hasInvestigatorCreatedAt = ensureInvestigatorCreatedAtColumn($investigatorsdb);
$hasInvestigatorFullname = ensureInvestigatorTextColumn($investigatorsdb, 'fullname');
$hasInvestigatorKana = ensureInvestigatorTextColumn($investigatorsdb, 'kana');

// -------------------------
// JSON レスポンス ヘルパー
// -------------------------
function jsonResponse($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------
// JSONフィールドの安全なパース
// -------------------------
function parseJsonField($value, $fallback = []) {
    if (is_array($value)) return $value;
    if ($value === null || $value === '') return $fallback;
    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : $fallback;
}

// -------------------------
// カラム存在確認 & 追加
// -------------------------
function hasColumn(PDO $db, string $table, string $column): bool {
    $stmt = $db->query("PRAGMA table_info($table)");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        if (($col['name'] ?? '') === $column) return true;
    }
    return false;
}

function ensureInvestigatorCreatedAtColumn(PDO $db): bool {
    if (hasColumn($db, 'investigators', 'created_at')) return true;
    try {
        $db->exec("ALTER TABLE investigators ADD COLUMN created_at TEXT");
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

function ensureInvestigatorTextColumn(PDO $db, string $column): bool {
    if (hasColumn($db, 'investigators', $column)) return true;
    try {
        $db->exec("ALTER TABLE investigators ADD COLUMN {$column} TEXT");
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

// -------------------------
// 探索者画像保存ヘルパー
// -------------------------
function ensureDir($dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
    }
}

function deleteInvestigatorImages($id, $dir) {
    foreach (glob($dir . "/{$id}.*") as $file) {
        @unlink($file);
    }
}

function deleteInvestigatorThumbs($id, $dir) {
    foreach (glob($dir . "/{$id}.*") as $file) {
        @unlink($file);
    }
}

function createInvestigatorThumb(string $src, string $dest, int $width = 200, int $height = 400, ?array $crop = null): bool {
    [$w, $h, $type] = getimagesize($src);

    switch ($type) {
        case IMAGETYPE_JPEG: $srcImg = imagecreatefromjpeg($src); break;
        case IMAGETYPE_PNG:  $srcImg = imagecreatefrompng($src);  break;
        case IMAGETYPE_GIF:  $srcImg = imagecreatefromgif($src);  break;
        default: return false;
    }

    if ($crop && isset($crop['width'], $crop['height'])) {
        $newW = max(1, (int)round($crop['width']));
        $newH = max(1, (int)round($crop['height']));
        $srcX = (int)round($crop['x'] ?? 0);
        $srcY = (int)round($crop['y'] ?? 0);

        if ($srcX < 0) $srcX = 0;
        if ($srcY < 0) $srcY = 0;
        if ($srcX + $newW > $w) $newW = $w - $srcX;
        if ($srcY + $newH > $h) $newH = $h - $srcY;
    } else {
        $targetRatio = $width / $height; // 1:2
        $srcRatio = $w / $h;

        if ($srcRatio > $targetRatio) {
            // 横が広い -> 幅をトリミング
            $newW = (int)($h * $targetRatio);
            $newH = $h;
            $srcX = (int)(($w - $newW) / 2);
            $srcY = 0;
        } else {
            // 縦が長い -> 高さをトリミング
            $newW = $w;
            $newH = (int)($w / $targetRatio);
            $srcX = 0;
            $srcY = (int)(($h - $newH) / 2);
        }
    }

    $thumb = imagecreatetruecolor($width, $height);
    // 透過PNG対応
    imagealphablending($thumb, false);
    imagesavealpha($thumb, true);
    $transparent = imagecolorallocatealpha($thumb, 0, 0, 0, 127);
    imagefilledrectangle($thumb, 0, 0, $width, $height, $transparent);
    imagecopyresampled(
        $thumb, $srcImg,
        0, 0,
        $srcX, $srcY,
        $width, $height,
        $newW, $newH
    );

    imagepng($thumb, $dest);
    imagedestroy($srcImg);
    imagedestroy($thumb);
    return true;
}

// =========================
// イラスト一覧取得API
// =========================
if ($path === 'api/admin.php/admin_list') {
    // 管理者チェック
    if (empty($_SESSION['admin'])) {
        jsonResponse(['error' => 'forbidden'], 403);
    }

    $stmt = $illustdb->query(
        "SELECT *
         FROM illust
         ORDER BY id DESC"
    );

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$r) {
        // JSON → 配列
        $r['tags'] = json_decode($r['tags'], true) ?? [];

        // カンマ区切り文字列として返す
        $r['tagsStr'] = implode(',', $r['tags']);

        $r['image'] = "{$basePrefix}assets/img/illust/thumb/{$r['id']}.jpg";
        $r['hide_flg'] = (bool)$r['hide_flg'];
        $r['hide_Q'] = $r['hide_Q'] ?? '';
        $r['hide_A'] = $r['hide_A'] ?? '';
        $r['caption'] = $r['caption'] ?? '';
        $r['title'] = $r['title'] ?? '';
    }

    jsonResponse($rows);
}


// =========================
// イラスト一覧編集API
// =========================
if ($path === 'api/admin.php/update_item') {

    // 管理者チェック
    if (empty($_SESSION['admin'])) {
        jsonResponse(['error' => 'forbidden'], 403);
    }

    // タグ処理
    $tagsRaw = $_POST['tags'] ?? '';
    // カンマ・半角スペース・全角スペースで分割
    $tagsArray = preg_split('/[\s,　]+/u', $tagsRaw, -1, PREG_SPLIT_NO_EMPTY);
    // 配列を JSON 文字列に変換して DB に保存
    $tagsJson = json_encode(array_values($tagsArray), JSON_UNESCAPED_UNICODE);

    $stmt = $illustdb->prepare(
        "UPDATE illust SET title=?, created_ymd=?, caption=?, tags=?, hide_flg=?, hide_Q=?, hide_A=? WHERE id=?"
    );
    $stmt->execute([
        $_POST['title'] ?? '',
        $_POST['created_ymd'] ?? '',
        $_POST['caption'] ?? '',
        $tagsJson,
        (int)($_POST['hide_flg'] ?? 0),
        $_POST['hide_Q'] ?? '',
        $_POST['hide_A'] ?? '',
        $_POST['id']
    ]);

    echo json_encode(['ok'=>true]);
    exit;
}

// =========================
// イラスト削除API
// =========================
if ($path === 'api/admin.php/delete_item') {

    // 管理者チェック
    if (empty($_SESSION['admin'])) {
        jsonResponse(['error' => 'forbidden'], 403);
    }

    // idチェック
    $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
    if ($id <= 0) {
        jsonResponse(['error' => 'invalid id'], 400);
    }

    // 対象レコードの存在確認（拡張子取得用）
    $stmt = $illustdb->prepare("SELECT ext FROM illust WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        jsonResponse(['error' => 'not found'], 404);
    }

    // DB から削除
    $stmt = $illustdb->prepare("DELETE FROM illust WHERE id = ?");
    $stmt->execute([$id]);

    // 画像ファイル削除（存在すれば）
    $ext = $row['ext'];
    $imgPath   = dirname(__DIR__) . "/assets/img/illust/{$id}.{$ext}";
    $thumbPath = dirname(__DIR__) . "/assets/img/illust/thumb/{$id}.jpg";

    if (file_exists($imgPath)) {
        unlink($imgPath);
    }
    if (file_exists($thumbPath)) {
        unlink($thumbPath);
    }

    jsonResponse(['ok' => true]);
}

// =========================
// イラストアップロードAPI
// =========================

// デバッグ: アップロード内容を一時的にファイル出力
if ($path === 'api/admin.php/upload_illust' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $debugLog = __DIR__ . '/../db/upload_debug.log';
    if ($ADMIN_DEBUG) {
        file_put_contents($debugLog, "==== " . date('Y-m-d H:i:s') . " ====".PHP_EOL, FILE_APPEND);
        file_put_contents($debugLog, '$_FILES: ' . var_export($_FILES, true) . PHP_EOL, FILE_APPEND);
        file_put_contents($debugLog, '$_POST: ' . var_export($_POST, true) . PHP_EOL, FILE_APPEND);
    }

    if (empty($_SESSION['admin'])) {
        jsonResponse(['error' => 'forbidden'], 403);
        exit;
    }

    if (empty($_FILES['image']['tmp_name'])) {
        jsonResponse(['error' => 'no image'], 400);
        exit;
    }

    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif'], true)) {
        jsonResponse(['error' => 'invalid file type'], 400);
        exit;
    }

    // タグ処理
    $tagsRaw = $_POST['tags'] ?? '';
    // カンマ・半角スペース・全角スペースで分割
    $tagsArray = preg_split('/[\s,　]+/u', $tagsRaw, -1, PREG_SPLIT_NO_EMPTY);
    // 配列を JSON 文字列に変換して DB に保存
    $tagsJson = json_encode(array_values($tagsArray), JSON_UNESCAPED_UNICODE);

    $stmt = $illustdb->prepare(
        "INSERT INTO illust
        (ext, created_ymd, title, caption, tags, hide_flg, hide_Q, hide_A)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)"
    );

    $stmt->execute([
        $ext,
        $_POST['created_ymd'] ?? '',
        $_POST['title'] ?? '',
        $_POST['caption'] ?? '',
        $tagsJson,
        !empty($_POST['hide_flg']) ? 1 : 0,
        $_POST['hide_Q'] ?? '',
        $_POST['hide_A'] ?? ''
    ]);

    $id = (int)$illustdb->lastInsertId();

    $imgPath   = dirname(__DIR__) . "/assets/img/illust/{$id}.{$ext}";
    $thumbPath = dirname(__DIR__) . "/assets/img/illust/thumb/{$id}.jpg";

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $imgPath)) {
        jsonResponse(['error' => 'upload failed'], 500);
        exit;
    }

    if (!createThumbnail($imgPath, $thumbPath)) {
        jsonResponse(['error' => 'thumbnail failed'], 500);
        exit;
    }

    jsonResponse(['ok' => true, 'id' => $id]);
    exit;
}

// -------------------------
// サムネイル生成
// -------------------------
function createThumbnail(string $src, string $dest, int $size = 200): bool {
    [$w, $h, $type] = getimagesize($src);

    switch ($type) {
        case IMAGETYPE_JPEG: $srcImg = imagecreatefromjpeg($src); break;
        case IMAGETYPE_PNG:  $srcImg = imagecreatefrompng($src);  break;
        case IMAGETYPE_GIF:  $srcImg = imagecreatefromgif($src);  break;
        default: return false;
    }

    $min  = min($w, $h);
    $srcX = (int)(($w - $min) / 2);
    $srcY = (int)(($h - $min) / 2);

    $thumb = imagecreatetruecolor($size, $size);
    // ここで白背景を塗る
    $white = imagecolorallocate($thumb, 255, 255, 255);
    imagefilledrectangle($thumb, 0, 0, $size, $size, $white);

    // PNG等の透過画像も白背景で合成
    imagecopyresampled(
        $thumb, $srcImg,
        0, 0,
        $srcX, $srcY,
        $size, $size,
        $min, $min
    );

    imagejpeg($thumb, $dest, 90);
    imagedestroy($srcImg);
    imagedestroy($thumb);
    return true;
}

// =========================
// 探索者一覧取得API
// =========================
if ($path === 'api/admin.php/admin_investigator_list') {

    $stmt = $investigatorsdb->query(
        "SELECT *
         FROM investigators
         ORDER BY id DESC"
    );

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse JSON fields so frontend receives native structures
    foreach ($rows as &$r) {
        $r['feature'] = parseJsonField($r['feature'] ?? '[]', []);
        $r['status'] = parseJsonField($r['status'] ?? '{}', []);
        $r['skill'] = parseJsonField($r['skill'] ?? '{}', []);
    }

    jsonResponse($rows);
}

// =========================
// 探索者詳細取得API
// =========================
if ($path === 'api/admin.php/admin_investigator_detail') {

    // 管理者チェック
    if (empty($_SESSION['admin'])) {
        http_response_code(403);
        echo json_encode(['error' => 'forbidden']);
        exit;
    }

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'id missing']);
        exit;
    }

    try {
        $stmt = $investigatorsdb->prepare('SELECT * FROM investigators WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'not found']);
            exit;
        }
        // Ensure JSON fields are parsed into native structures before returning
        $row['feature'] = parseJsonField($row['feature'] ?? '[]', []);
        $row['status'] = parseJsonField($row['status'] ?? '{}', []);
        $row['skill'] = parseJsonField($row['skill'] ?? '{}', []);
        jsonResponse(['ok' => true, 'data' => $row]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}

// =========================
// 探索者削除API
// =========================
if ($path === 'api/admin.php/delete_investigator') {

    // 管理者チェック
    if (empty($_SESSION['admin'])) {
        http_response_code(403);
        echo json_encode(['error' => 'forbidden']);
        exit;
    }

    $id = $_POST['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'id missing']);
        exit;
    }

    try {
        $stmt = $investigatorsdb->prepare('DELETE FROM investigators WHERE id = ?');
        $ok = $stmt->execute([$id]);

        echo json_encode([
            'ok' => $ok
        ]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'error' => $e->getMessage()
        ]);
    }
}

// =========================
// 探索者登録API
// =========================
if (isset($_GET['action']) && $_GET['action'] === 'add_investigator') {

    // 管理者チェック
    if (empty($_SESSION['admin'])) {
        http_response_code(403);
        jsonResponse(['ok' => false, 'error' => 'forbidden']);
    }

    // JSON or FormData 読み込み
    $data = null;
    if (!empty($_POST)) {
        $data = $_POST;
        $data['feature'] = parseJsonField($data['feature'] ?? '[]', []);
        $data['status'] = parseJsonField($data['status'] ?? '{}', []);
        $data['skill'] = parseJsonField($data['skill'] ?? '{}', []);
    } else {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
    }

    if (!$data) {
        http_response_code(400);
        jsonResponse(['ok' => false, 'error' => '入力エラー']);
    }

    // バリデーション
    if (empty($data['name']) || empty($data['job'])) {
        http_response_code(400);
        jsonResponse(['ok' => false, 'error' => '名前と職業は必須です']);
    }

    try {
        $columns = [
            'name',
            'age',
            'sex',
            'height',
            'job',
            'feature',
            'pc_from',
            'detail',
            'url',
            'status',
            'skill'
        ];
        $params = [
            ':name'    => $data['name'],
            ':age'     => $data['age'] ?? '',
            ':sex'     => $data['sex'] ?? '',
            ':height'  => $data['height'] ?? '',
            ':job'     => $data['job'],
            ':feature' => json_encode($data['feature'] ?? [], JSON_UNESCAPED_UNICODE),
            ':pc_from' => $data['pc_from'] ?? '',
            ':detail'  => $data['detail'] ?? '',
            ':url'     => $data['url'] ?? '',
            ':status'  => json_encode($data['status'] ?? [], JSON_UNESCAPED_UNICODE),
            ':skill'   => json_encode($data['skill'] ?? [], JSON_UNESCAPED_UNICODE),
        ];

        if ($hasInvestigatorFullname) {
            $columns[] = 'fullname';
            $params[':fullname'] = $data['fullname'] ?? '';
        }
        if ($hasInvestigatorKana) {
            $columns[] = 'kana';
            $params[':kana'] = $data['kana'] ?? '';
        }
        if ($hasInvestigatorCreatedAt) {
            $columns[] = 'created_at';
            $params[':created_at'] = date('Ymd');
        }

        $placeholders = array_map(fn($col) => ':' . $col, $columns);
        $sql = sprintf(
            'INSERT INTO investigators (%s) VALUES (%s)',
            implode(', ', $columns),
            implode(', ', $placeholders)
        );
        $stmt = $investigatorsdb->prepare($sql);
        $stmt->execute($params);

        $id = $investigatorsdb->lastInsertId();

        // 画像保存
        if (!empty($_FILES['image']['tmp_name'])) {
            $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, ['jpg','jpeg','png','gif'], true)) {
                jsonResponse(['ok' => false, 'error' => 'invalid image type'], 400);
            }

            $baseDir = dirname(__DIR__) . '/assets/img/investigator';
            $thumbDir = $baseDir . '/thumb';
            ensureDir($baseDir);
            ensureDir($thumbDir);

            $ext = $ext === 'jpeg' ? 'jpg' : $ext;
            $imgPath = $baseDir . "/{$id}.{$ext}";
            $thumbPath = $thumbDir . "/{$id}.png";

            if (!move_uploaded_file($_FILES['image']['tmp_name'], $imgPath)) {
                jsonResponse(['ok' => false, 'error' => 'upload failed'], 500);
            }
            $crop = parseJsonField($_POST['crop'] ?? null, null);
            if (!createInvestigatorThumb($imgPath, $thumbPath, 200, 400, $crop)) {
                jsonResponse(['ok' => false, 'error' => 'thumbnail failed'], 500);
            }
        }

        jsonResponse(['ok' => true, 'id' => $id]);

    } catch (Throwable $e) {
        http_response_code(500);
        jsonResponse(['ok' => false, 'error' => $e->getMessage()]);
    }
}

// =========================
// 探索者更新API
// =========================
if (isset($_GET['action']) && $_GET['action'] === 'update_investigator') {

    // 管理者チェック
    if (empty($_SESSION['admin'])) {
        http_response_code(403);
        jsonResponse(['ok' => false, 'error' => 'forbidden']);
    }

    // JSON or FormData 読み込み
    $data = null;
    if (!empty($_POST)) {
        $data = $_POST;
        $data['feature'] = parseJsonField($data['feature'] ?? '[]', []);
        $data['status'] = parseJsonField($data['status'] ?? '{}', []);
        $data['skill'] = parseJsonField($data['skill'] ?? '{}', []);
    } else {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
    }

    if (!$data) {
        http_response_code(400);
        jsonResponse(['ok' => false, 'error' => '入力エラー']);
    }

    if (empty($data['id'])) {
        http_response_code(400);
        jsonResponse(['ok' => false, 'error' => 'id missing']);
    }

    // バリデーション
    if (empty($data['name']) || empty($data['job'])) {
        http_response_code(400);
        jsonResponse(['ok' => false, 'error' => '名前と職業は必須です']);
    }

    try {
        $setParts = [
            'name = :name',
            'age = :age',
            'sex = :sex',
            'height = :height',
            'job = :job',
            'feature = :feature',
            'pc_from = :pc_from',
            'detail = :detail',
            'url = :url',
            'status = :status',
            'skill = :skill'
        ];
        $params = [
            ':id'      => $data['id'],
            ':name'    => $data['name'],
            ':age'     => $data['age'] ?? '',
            ':sex'     => $data['sex'] ?? '',
            ':height'  => $data['height'] ?? '',
            ':job'     => $data['job'],
            ':feature' => json_encode($data['feature'] ?? [], JSON_UNESCAPED_UNICODE),
            ':pc_from' => $data['pc_from'] ?? '',
            ':detail'  => $data['detail'] ?? '',
            ':url'     => $data['url'] ?? '',
            ':status'  => json_encode($data['status'] ?? [], JSON_UNESCAPED_UNICODE),
            ':skill'   => json_encode($data['skill'] ?? [], JSON_UNESCAPED_UNICODE),
        ];

        if ($hasInvestigatorFullname) {
            $setParts[] = 'fullname = :fullname';
            $params[':fullname'] = $data['fullname'] ?? '';
        }
        if ($hasInvestigatorKana) {
            $setParts[] = 'kana = :kana';
            $params[':kana'] = $data['kana'] ?? '';
        }

        $sql = 'UPDATE investigators SET ' . implode(', ', $setParts) . ' WHERE id = :id';
        $stmt = $investigatorsdb->prepare($sql);
        $ok = $stmt->execute($params);

        // 画像保存（更新時は差し替え）
        if (!empty($_FILES['image']['tmp_name'])) {
            $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, ['jpg','jpeg','png','gif'], true)) {
                jsonResponse(['ok' => false, 'error' => 'invalid image type'], 400);
            }

            $baseDir = dirname(__DIR__) . '/assets/img/investigator';
            $thumbDir = $baseDir . '/thumb';
            ensureDir($baseDir);
            ensureDir($thumbDir);

            deleteInvestigatorImages($data['id'], $baseDir);
            deleteInvestigatorThumbs($data['id'], $thumbDir);

            $ext = $ext === 'jpeg' ? 'jpg' : $ext;
            $imgPath = $baseDir . "/{$data['id']}.{$ext}";
            $thumbPath = $thumbDir . "/{$data['id']}.png";

            if (!move_uploaded_file($_FILES['image']['tmp_name'], $imgPath)) {
                jsonResponse(['ok' => false, 'error' => 'upload failed'], 500);
            }
            $crop = parseJsonField($_POST['crop'] ?? null, null);
            if (!createInvestigatorThumb($imgPath, $thumbPath, 200, 400, $crop)) {
                jsonResponse(['ok' => false, 'error' => 'thumbnail failed'], 500);
            }
        }

        jsonResponse(['ok' => $ok]);
    } catch (Throwable $e) {
        http_response_code(500);
        jsonResponse(['ok' => false, 'error' => $e->getMessage()]);
    }
}

// =========================
// 探索者登録日更新API
// =========================
if (isset($_GET['action']) && $_GET['action'] === 'update_investigator_created_at') {

    // 管理者チェック
    if (empty($_SESSION['admin'])) {
        http_response_code(403);
        jsonResponse(['ok' => false, 'error' => 'forbidden']);
    }

    // JSON or FormData 読み込み
    $data = null;
    if (!empty($_POST)) {
        $data = $_POST;
    } else {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
    }

    if (!$data) {
        http_response_code(400);
        jsonResponse(['ok' => false, 'error' => '入力エラー']);
    }

    if (empty($data['id'])) {
        http_response_code(400);
        jsonResponse(['ok' => false, 'error' => 'id missing']);
    }

    $createdAt = $data['created_at'] ?? '';

    try {
        $stmt = $investigatorsdb->prepare("UPDATE investigators SET created_at = :created_at WHERE id = :id");
        $ok = $stmt->execute([
            ':id' => $data['id'],
            ':created_at' => $createdAt
        ]);
        jsonResponse(['ok' => $ok]);
    } catch (Throwable $e) {
        http_response_code(500);
        jsonResponse(['ok' => false, 'error' => $e->getMessage()]);
    }
}