const BASE = import.meta.env.DEV
  ? 'http://localhost:8000'          // 内蔵サーバーでは jpディレクトリ内で起動
  : '';          // レンタルサーバーでは / がルート

export const ADMIN_AUTH_BASE = `${BASE}/api/admin_auth.php`;
export const ADMIN_BASE = `${BASE}/api/admin.php`;
export const ILLUST_BASE = `${BASE}/api/illust.php`;
export const INVESTIGATOR_BASE = `${BASE}/api/investigator.php`;

/* =========================
 * Admin Auth API
 * ========================= */

export async function login (password) {
  try {
    const r = await fetch(`${ADMIN_AUTH_BASE}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password })
    })
    return await r.json()
  } catch (e) {
    return { ok: false, error: '通信エラー' }
  }
}

export async function check () {
  try {
    const r = await fetch(`${ADMIN_AUTH_BASE}?action=check`, {
      credentials: 'include'
    })
    return await r.json()
  } catch (e) {
    return { ok: false }
  }
}

export async function logout () {
  try {
    const r = await fetch(`${ADMIN_AUTH_BASE}?action=logout`, {
      method: 'POST',
      credentials: 'include'
    })
    return await r.json()
  } catch (e) {
    return { ok: false }
  }
}

/* =========================
 * Admin API
 * ========================= */

/**
 * イラスト情報一覧取得
 */
export async function adminList () {
  return fetch(`${ADMIN_BASE}?action=admin_list`, {
    credentials: 'include'
  }).then(r => r.json())
}

/**
 * イラスト編集
 */
export async function updateItem (fd) {
  const res = await fetch(`${ADMIN_BASE}?action=update_item`, {
    method: 'POST',
    body: fd,
    credentials: 'include'
  })
  if (!res.ok) {
    throw new Error('update failed')
  }
  return await res.json()
}

/**
 * イラスト削除
 */
export async function deleteItem (id) {
  const fd = new FormData()
  fd.append('id', id)
  return fetch(`${ADMIN_BASE}?action=delete_item`, {
    method: 'POST',
    body: fd,
    credentials: 'include'
  }).then(r => r.json())
}

/**
 * イラストアップロード
 */
export const uploadIllust = async (fd) => {
  const res = await fetch(`${ADMIN_BASE}?action=upload_illust`, {
    method: 'POST',
    body: fd,
    credentials: 'include'
  })
  if (!res.ok) {
    throw new Error('upload failed')
  }
  return await res.json()
}


/**
 * 探索者情報一覧取得
 */
export async function adminInvestigatorList () {
  return fetch(`${ADMIN_BASE}?action=admin_investigator_list`, {
    credentials: 'include'
  }).then(r => r.json())
}

/**
 * 探索者情報詳細取得
 */
export async function adminInvestigatorDetail (id) {
  return fetch(`${ADMIN_BASE}?action=admin_investigator_detail&id=${encodeURIComponent(id)}`, {
    credentials: 'include'
  }).then(r => r.json())
}

/**
 * 探索者情報削除
 */
export async function deleteInvestigator(id) {
  const fd = new FormData()
  fd.append('id', id)

  const res = await fetch(`${ADMIN_BASE}?action=delete_investigator`, {
    method: 'POST',
    body: fd,
    credentials: 'include'
  })

  const text = await res.text()

  try {
    return JSON.parse(text)
  } catch (e) {
    console.error('JSON parse failed:', text)
    throw e
  }
}

/**
 * 探索者情報登録
 */
export async function addInvestigator(data) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
  const res = await fetch(`${ADMIN_BASE}?action=add_investigator`, {
    method: 'POST',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: isFormData ? data : JSON.stringify(data)
  })

  if (!res.ok) {
    throw new Error('add investigator failed')
  }

  return await res.json()
}

/**
 * 探索者情報更新
 */
export async function updateInvestigator(data) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
  const res = await fetch(`${ADMIN_BASE}?action=update_investigator`, {
    method: 'POST',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: isFormData ? data : JSON.stringify(data)
  })

  if (!res.ok) {
    throw new Error('update investigator failed')
  }

  return await res.json()
}

/**
 * 探索者登録日更新
 */
export async function updateInvestigatorCreatedAt(id, createdAt) {
  const fd = new FormData()
  fd.append('id', id)
  fd.append('created_at', createdAt ?? '')
  const res = await fetch(`${ADMIN_BASE}?action=update_investigator_created_at`, {
    method: 'POST',
    body: fd,
    credentials: 'include'
  })

  if (!res.ok) {
    throw new Error('update investigator created_at failed')
  }

  return await res.json()
}

/* =========================
 * Illust API
 * ========================= */

/**
 * イラスト一覧取得
 */
export async function illustList () {
  return fetch(`${ILLUST_BASE}?mode=list`, {
    credentials: 'include'
  }).then(r => r.json())
}

/**
 * イラスト詳細取得
 */
export async function illustDetail (id) {
  return fetch(`${ILLUST_BASE}?mode=detail&id=${encodeURIComponent(id)}`, {
    credentials: 'include'
  }).then(r => r.json())
}

/* =========================
 * Investigator API
 * ========================= */

export async function investigatorList () {
  return fetch(`${INVESTIGATOR_BASE}?mode=investigator_list`, {
    credentials: 'include'
  }).then(r => r.json())
}

export async function investigatorDetail (id) {
  return fetch(`${INVESTIGATOR_BASE}?mode=investigator_detail&id=${encodeURIComponent(id)}`, {
    credentials: 'include'
  }).then(r => r.json())
}
