// API ベース URL は Vite の環境変数 `VITE_API_BASE` で上書き可能
// 例: VITE_API_BASE=http://localhost:8000
const API_BASE =
  import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

const build = (path) => `${API_BASE}${path}`;

export const ADMIN_AUTH_BASE = build('/api/admin_auth.php');
export const ADMIN_BASE = build('/api/admin.php');
export const ILLUST_BASE = build('/api/illust.php');
export const INVESTIGATOR_BASE = build('/api/investigator.php');

// 共通の安全な JSON フェッチユーティリティ（通信エラーや JSON パースエラーを統一表現で返す）
async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, { credentials: 'include', ...options });
    const text = await res.text();
    try {
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) return { ok: false, error: json?.error || 'request failed' };
      return json;
    } catch (e) {
      return { ok: false, error: 'invalid json' };
    }
  } catch (e) {
    return { ok: false, error: 'network error' };
  }
}

/* =========================
 * Admin Auth API
 * ========================= */

export async function login(password) {
  return safeFetchJson(`${ADMIN_AUTH_BASE}?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}

export async function check() {
  return safeFetchJson(`${ADMIN_AUTH_BASE}?action=check`);
}

export async function logout() {
  return safeFetchJson(`${ADMIN_AUTH_BASE}?action=logout`, { method: 'POST' });
}

/* =========================
 * Admin API
 * ========================= */

/**
 * イラスト情報一覧取得
 */
export async function adminList() {
  return safeFetchJson(`${ADMIN_BASE}?action=admin_list`);
}

/**
 * イラスト編集
 */
export async function updateItem(fd) {
  return safeFetchJson(`${ADMIN_BASE}?action=update_item`, { method: 'POST', body: fd });
}

/**
 * イラスト削除
 */
export async function deleteItem(id) {
  const fd = new FormData();
  fd.append('id', id);
  return safeFetchJson(`${ADMIN_BASE}?action=delete_item`, { method: 'POST', body: fd });
}

/**
 * イラストアップロード
 */
export const uploadIllust = async (fd) => {
  return safeFetchJson(`${ADMIN_BASE}?action=upload_illust`, { method: 'POST', body: fd });
};

/**
 * 探索者情報一覧取得
 */
export async function adminInvestigatorList() {
  return safeFetchJson(`${ADMIN_BASE}?action=admin_investigator_list`);
}

/**
 * 探索者情報詳細取得
 */
export async function adminInvestigatorDetail(id) {
  return safeFetchJson(
    `${ADMIN_BASE}?action=admin_investigator_detail&id=${encodeURIComponent(id)}`
  );
}

/**
 * 探索者情報削除
 */
export async function deleteInvestigator(id) {
  const fd = new FormData();
  fd.append('id', id);
  return safeFetchJson(`${ADMIN_BASE}?action=delete_investigator`, { method: 'POST', body: fd });
}

/**
 * 探索者情報登録
 */
export async function addInvestigator(data) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const options = {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
  };
  return safeFetchJson(`${ADMIN_BASE}?action=add_investigator`, options);
}

/**
 * 探索者情報更新
 */
export async function updateInvestigator(data) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const options = {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
  };
  return safeFetchJson(`${ADMIN_BASE}?action=update_investigator`, options);
}

/**
 * 探索者登録日更新
 */
export async function updateInvestigatorCreatedAt(id, createdAt) {
  const fd = new FormData();
  fd.append('id', id);
  fd.append('created_at', createdAt ?? '');
  return safeFetchJson(`${ADMIN_BASE}?action=update_investigator_created_at`, {
    method: 'POST',
    body: fd,
  });
}

/* =========================
 * Illust API
 * ========================= */

/**
 * イラスト一覧取得
 */
export async function illustList() {
  return safeFetchJson(`${ILLUST_BASE}?mode=list`);
}

/**
 * イラスト詳細取得
 */
export async function illustDetail(id) {
  return safeFetchJson(`${ILLUST_BASE}?mode=detail&id=${encodeURIComponent(id)}`);
}

/* =========================
 * Investigator API
 * ========================= */

export async function investigatorList() {
  return safeFetchJson(`${INVESTIGATOR_BASE}?mode=investigator_list`);
}

export async function investigatorDetail(id) {
  return safeFetchJson(
    `${INVESTIGATOR_BASE}?mode=investigator_detail&id=${encodeURIComponent(id)}`
  );
}
