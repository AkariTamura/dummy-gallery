<?php
// Simple proxy to fetch external resources on behalf of the frontend
// Only allow whitelisted hosts to avoid open proxy abuse

// CORS: allow Vite origin or request origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$url = $_GET['url'] ?? '';
if (!$url) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'missing url']);
    exit;
}

$DEBUG = false; // set to true temporarily for troubleshooting
$debugLog = __DIR__ . '/../db/proxy_debug.log';
if ($DEBUG) {
    file_put_contents($debugLog, "==== " . date('Y-m-d H:i:s') . " ====\n", FILE_APPEND);
    file_put_contents($debugLog, "REMOTE_ADDR: " . ($_SERVER['REMOTE_ADDR'] ?? '') . "\n", FILE_APPEND);
    file_put_contents($debugLog, "ORIGIN: " . ($origin ?? '') . "\n", FILE_APPEND);
    file_put_contents($debugLog, "REQUEST_URL: " . $url . "\n", FILE_APPEND);
    file_put_contents($debugLog, "CURL_AVAILABLE: " . (function_exists('curl_init') ? 'yes' : 'no') . "\n", FILE_APPEND);
    file_put_contents($debugLog, "ALLOW_URL_FOPEN: " . (ini_get('allow_url_fopen') ? 'yes' : 'no') . "\n", FILE_APPEND);
}

$allowedHosts = [
    'charasheet.vampire-blood.net',
];

$parsed = parse_url($url);
if (!isset($parsed['host']) || !in_array($parsed['host'], $allowedHosts, true)) {
    file_put_contents($debugLog, "HOST_NOT_ALLOWED: " . ($parsed['host'] ?? '') . "\n", FILE_APPEND);
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'host not allowed']);
    exit;
}

if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    // set a User-Agent
    curl_setopt($ch, CURLOPT_USERAGENT, 'sakoker-proxy/1.0');

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'application/octet-stream';
    $err = curl_error($ch);
    curl_close($ch);
    if ($DEBUG) {
        file_put_contents($debugLog, "CURL_HTTP_CODE: {$httpCode}\n", FILE_APPEND);
        file_put_contents($debugLog, "CURL_CONTENT_TYPE: {$contentType}\n", FILE_APPEND);
        file_put_contents($debugLog, "CURL_ERROR: {$err}\n", FILE_APPEND);
        file_put_contents($debugLog, "CURL_RESPONSE_LEN: " . strlen((string)$response) . "\n", FILE_APPEND);
    }

    if ($response === false) {
        if ($DEBUG) file_put_contents($debugLog, "CURL_FETCH_FAILED\n", FILE_APPEND);
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'fetch failed', 'detail' => $err]);
        exit;
    }

    // If HTML, try to extract embedded JSON (common patterns) and return JSON to the frontend
    if (stripos($contentType, 'text/html') !== false) {
        // try extracting JSON from <script> blocks or JS variable assignments
        $extracted = null;
        // 1) script tags
        if (preg_match_all('#<script[^>]*>([\s\S]*?)</script>#i', $response, $m)) {
            foreach ($m[1] as $scriptContent) {
                $scriptContent = trim($scriptContent);
                // try direct JSON
                $maybe = null;
                if ($scriptContent && ($decoded = json_decode($scriptContent, true)) && (is_array($decoded) || is_object($decoded))) {
                    $maybe = $decoded;
                } else {
                    // try to find a JS var assignment like: var data = {...};
                    if (preg_match('#(?:var|let|const)\s+[A-Za-z0-9_]+\s*=\s*(\{[\s\S]*\})\s*;#i', $scriptContent, $mm)) {
                        $js = $mm[1];
                        $decoded = json_decode($js, true);
                        if ($decoded && (is_array($decoded) || is_object($decoded))) $maybe = $decoded;
                    }
                }
                if ($maybe) { $extracted = $maybe; break; }
            }
        }

        // 2) fallback: try to find a JSON blob anywhere in the HTML
        if (!$extracted) {
            if (preg_match('#(\{\s*"name"[\s\S]*?\})#i', $response, $mm)) {
                $decoded = json_decode($mm[1], true);
                if ($decoded && (is_array($decoded) || is_object($decoded))) $extracted = $decoded;
            }
        }

        if ($extracted) {
            header('Content-Type: application/json');
            http_response_code(200);
            echo json_encode($extracted, JSON_UNESCAPED_UNICODE);
            exit;
        }

        // otherwise forward HTML as-is
    }

    header('Content-Type: ' . $contentType);
    http_response_code($httpCode ?: 200);
    echo $response;
    exit;
} else {
    // Fallback to file_get_contents if cURL is not available
    if (!ini_get('allow_url_fopen')) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'curl not available and allow_url_fopen is disabled']);
        exit;
    }

    $opts = [
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: sakoker-proxy/1.0\r\n",
            'timeout' => 15,
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ];

    $context = stream_context_create($opts);
    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        if ($DEBUG) file_put_contents($debugLog, "FILE_GET_CONTENTS_FAILED\n", FILE_APPEND);
        if (isset($http_response_header)) {
            if ($DEBUG) file_put_contents($debugLog, "FGC_HEADERS_ON_FAIL:\n" . implode("\n", $http_response_header) . "\n", FILE_APPEND);
        }

        // As a fallback for development environments where SSL verification fails,
        // try again with relaxed SSL verification and allow fetching error pages.
        $fallbackOpts = [
            'http' => [
                'method' => 'GET',
                'header' => "User-Agent: sakoker-proxy/1.0\r\n",
                'timeout' => 15,
                'ignore_errors' => true,
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ],
        ];
        $fallbackContext = stream_context_create($fallbackOpts);
        $response = @file_get_contents($url, false, $fallbackContext);
        if ($response === false) {
            if ($DEBUG) file_put_contents($debugLog, "FILE_GET_CONTENTS_FALLBACK_FAILED\n", FILE_APPEND);
            if (isset($http_response_header) && $DEBUG) {
                file_put_contents($debugLog, "FGC_FALLBACK_HEADERS:\n" . implode("\n", $http_response_header) . "\n", FILE_APPEND);
            }
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'fetch failed (file_get_contents)']);
            exit;
        }

        // on fallback success, try to extract headers
        $contentType = 'application/octet-stream';
        $httpCode = 200;
        if (isset($http_response_header) && is_array($http_response_header)) {
            if ($DEBUG) file_put_contents($debugLog, "FGC_FALLBACK_RESPONSE_HEADERS:\n" . implode("\n", $http_response_header) . "\n", FILE_APPEND);
            foreach ($http_response_header as $h) {
                if (stripos($h, 'Content-Type:') === 0) {
                    $contentType = trim(substr($h, strlen('Content-Type:')));
                }
                if (preg_match('#HTTP/\d+\.\d+\s+(\d+)#i', $h, $m)) {
                    $httpCode = (int)$m[1];
                }
            }
        }
        header('Content-Type: ' . $contentType);
        http_response_code($httpCode ?: 200);
        echo $response;
        exit;
    }

    // derive content-type and status from response headers if available
    $contentType = 'application/octet-stream';
    $httpCode = 200;
    if (isset($http_response_header) && is_array($http_response_header)) {
        if ($DEBUG) file_put_contents($debugLog, "RESPONSE_HEADERS:\n" . implode("\n", $http_response_header) . "\n", FILE_APPEND);
        foreach ($http_response_header as $h) {
            if (stripos($h, 'Content-Type:') === 0) {
                $contentType = trim(substr($h, strlen('Content-Type:')));
            }
            if (preg_match('#HTTP/\d+\.\d+\s+(\d+)#i', $h, $m)) {
                $httpCode = (int)$m[1];
            }
        }
    }

    if ($DEBUG) {
        file_put_contents($debugLog, "FGC_HTTP_CODE: {$httpCode}\n", FILE_APPEND);
        file_put_contents($debugLog, "FGC_CONTENT_TYPE: {$contentType}\n", FILE_APPEND);
        file_put_contents($debugLog, "FGC_RESPONSE_LEN: " . strlen((string)$response) . "\n", FILE_APPEND);
    }

    header('Content-Type: ' . $contentType);
    http_response_code($httpCode ?: 200);
    echo $response;
    exit;
}
