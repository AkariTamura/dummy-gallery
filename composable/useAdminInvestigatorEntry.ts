import { ref, onMounted, Ref, watch } from 'vue';
import investigatorInfo from '@/assets/json/investigatorInfo.json';
import {
  addInvestigator,
  adminInvestigatorDetail,
  updateInvestigator,
} from '@/util/api';

type StatusKey =
  | 'str'
  | 'con'
  | 'pow'
  | 'dex'
  | 'app'
  | 'siz'
  | 'int'
  | 'edu'
  | 'hp'
  | 'mp'
  | 'ini_san'
  | 'idea'
  | 'luck'
  | 'know'
  | 'san';

const makeDefaultStatus = () => {
  const keys: StatusKey[] = [
    'str',
    'con',
    'pow',
    'dex',
    'app',
    'siz',
    'int',
    'edu',
    'hp',
    'mp',
    'ini_san',
    'idea',
    'luck',
    'know',
    'san',
  ];
  const obj: Record<string, any> = {};
  for (const k of keys) {
    obj[k] = { default: null, ex1: 0, ex2: 0 };
  }
  return obj;
};

const defaultForm = () => ({
  id: null,
  name: '',
  fullname: '',
  kana: '',
  age: '',
  sex: '',
  height: '',
  job: '',
  pc_from: '',
  feature: '',
  detail: '',
  url: '',
  status: makeDefaultStatus(),
  skill: {},
});

export function useAdminInvestigatorEntry(editId: string | null = null) {
  const formData: Ref<any> = ref(defaultForm());
  const errors: Ref<Record<string, any>> = ref({});
  const original: Ref<any> = ref(null);
  const editingId: Ref<string | number | null> = ref(editId ?? null);

  const imageFile: Ref<File | null> = ref(null);
  const cropData: Ref<any | null> = ref(null);
  const sanFromApi: Ref<boolean> = ref(false);

  const setImageFile = (f: File | null) => {
    imageFile.value = f;
  };

  // --- Import helpers (adapted from original JS) ---
  const applyStatusValue = (key: string, value: any, field = 'default') => {
    if (!formData.value.status?.[key]) return
    const num = Number(value)
    if (!Number.isNaN(num)) {
      (formData.value.status[key] as any)[field] = num
    }
  }

  const getSkillKeyOrder = (category: string, prefix: string) => {
    const items = (formData.value.skill?.[category] || {}) as Record<string, any>
    return Object.keys(items)
      .filter(k => k.startsWith(prefix))
      .map((k) => ({ key: k, num: Number(k.replace(prefix, '')) }))
      .filter(item => Number.isFinite(item.num))
      .sort((a, b) => a.num - b.num)
      .map(item => item.key)
  }

  const applySkillArray = (category: string, prefix: string, values: any, field: string) => {
    if (!Array.isArray(values)) return
    const keys = getSkillKeyOrder(category, prefix)
    values.forEach((val: any, idx: number) => {
      const key = keys[idx]
      if (!key) return
      const item = formData.value.skill?.[category]?.[key]
      if (!item || Array.isArray(item)) return
      const num = Number(val)
      if (!Number.isNaN(num)) {
        item[field] = num
      }
    })
  }

  const setSkillLabel = (category: string, key: string, value: any) => {
    const label = String(value || '').trim()
    if (!label) return
    const item = formData.value.skill?.[category]?.[key]
    if (!item || Array.isArray(item)) return
    item.label = label
  }

  const SKILL_IMPORT_CONFIG = [
    { category: 'combat', prefix: 'sc', arrays: { ex1: 'TBAS', ex2: 'TBAK', ex3: 'TBAA', ex4: 'TBAO' }, extraKey: 'scet', extraNames: ['TBAName','TBName'], extraDefaults: 'TBAD' },
    { category: 'exp', prefix: 'se', arrays: { ex1: 'TFAS', ex2: 'TFAK', ex3: 'TFAA', ex4: 'TFAO' }, extraKey: 'seet', extraNames: ['TFAName','TFName'], extraDefaults: 'TFAD' },
    { category: 'act', prefix: 'sa', arrays: { ex1: 'TAAS', ex2: 'TAAK', ex3: 'TAAA', ex4: 'TAAO' }, extraKey: 'saet', extraNames: ['TAAName','TAName'], extraDefaults: 'TAAD' },
    { category: 'neg', prefix: 'sn', arrays: { ex1: 'TCAS', ex2: 'TCAK', ex3: 'TCAA', ex4: 'TCAO' }, extraKey: 'snet', extraNames: ['TCAName','TCName'], extraDefaults: 'TCAD' },
    { category: 'know', prefix: 'sk', arrays: { ex1: 'TKAS', ex2: 'TKAK', ex3: 'TKAA', ex4: 'TKAO' }, extraKey: 'sket', extraNames: ['TKAName','TKName'], extraDefaults: 'TKAD' }
  ]

  const LABEL_IMPORT_CONFIG = [
    { category: 'act', key: 'sa1', dataKey: 'unten_bunya', prefix: '運転' },
    { category: 'act', key: 'sa6', dataKey: 'seisaku_bunya', prefix: '製作' },
    { category: 'act', key: 'sa7', dataKey: 'main_souju_norimono', prefix: '操縦' },
    { category: 'know', key: 'sk5', dataKey: 'geijutu_bunya', prefix: '芸術' },
    { category: 'neg', key: 'sn5', dataKey: 'mylang_name', prefix: '母国語' }
  ]

  const applyExtraSkillsFromApi = (category: string, extraKey: string, names: any, defaults: any, ex1s: any, ex2s: any, ex3s: any, ex4s: any) => {
    if (!Array.isArray(names) || !names.length) return
    const items = formData.value.skill?.[category]
    if (!items || !Array.isArray(items[extraKey])) return

    const count = names.length
    const pickValue = (arr: any, idx: number) => {
      if (!Array.isArray(arr) || !arr.length) return 0
      const baseIndex = Math.max(0, arr.length - count)
      const value = arr[baseIndex + idx]
      const num = Number(value)
      return Number.isNaN(num) ? 0 : num
    }

    names.forEach((name: any, idx: number) => {
      const label = String(name || '').trim()
      if (!label) return
      const payload = {
        name: label,
        default: pickValue(defaults, idx),
        ex1: pickValue(ex1s, idx),
        ex2: pickValue(ex2s, idx),
        ex3: pickValue(ex3s, idx),
        ex4: pickValue(ex4s, idx)
      }

      const existing = (items[extraKey] as any[]).find(item => item?.name === label)
      if (existing) {
        existing.default = payload.default
        existing.ex1 = payload.ex1
        existing.ex2 = payload.ex2
        existing.ex3 = payload.ex3
        existing.ex4 = payload.ex4
      } else {
        (items[extraKey] as any[]).push(payload)
      }
    })
  }

  const applyApiData = (data: any, sourceUrl?: string) => {
    if (!data || typeof data !== 'object') return

    formData.value.name = data.pc_name ?? data.name ?? formData.value.name
    formData.value.age = data.age ?? formData.value.age
    formData.value.sex = data.sex ?? formData.value.sex
    const heightValue = data.pc_height ?? data.height
    if (heightValue !== undefined && heightValue !== null) {
      const rawHeight = String(heightValue)
      const numericHeight = rawHeight.replace(/[^0-9.]/g, '')
      formData.value.height = numericHeight || formData.value.height
    }
    formData.value.job = data.shuzoku ?? data.job ?? formData.value.job
    formData.value.detail = data.pc_making_memo ?? data.detail ?? formData.value.detail
    formData.value.url = sourceUrl || formData.value.url

    applyStatusValue('str', data.NA1)
    applyStatusValue('con', data.NA2)
    applyStatusValue('pow', data.NA3)
    applyStatusValue('dex', data.NA4)
    applyStatusValue('app', data.NA5)
    applyStatusValue('siz', data.NA6)
    applyStatusValue('int', data.NA7)
    applyStatusValue('edu', data.NA8)
    applyStatusValue('hp', data.NA9)
    applyStatusValue('mp', data.NA10)
    applyStatusValue('ini_san', data.NA11)
    applyStatusValue('idea', data.NA12)
    applyStatusValue('luck', data.NA13)
    applyStatusValue('know', data.NA14)

    const statusOrder = ['str','con','pow','dex','app','siz','int','edu','hp','mp','ini_san','idea','luck','know']
    statusOrder.forEach((key, idx) => {
      const sIndex = idx + 1
      applyStatusValue(key, data[`NS${sIndex}`], 'ex1')
      applyStatusValue(key, data[`NM${sIndex}`], 'ex2')
    })

    if (data.SAN_Left !== undefined && data.SAN_Left !== null) {
      applyStatusValue('san', data.SAN_Left)
      sanFromApi.value = true
    }

    SKILL_IMPORT_CONFIG.forEach((cfg) => {
      Object.entries(cfg.arrays).forEach(([field, key]: any) => {
        applySkillArray(cfg.category, cfg.prefix, data[key], field)
      })

      const nameKey = cfg.extraNames.find((k: any) => Array.isArray(data[k]))
      if (nameKey) {
        applyExtraSkillsFromApi(
          cfg.category,
          cfg.extraKey,
          data[nameKey],
          data[cfg.extraDefaults],
          data[cfg.arrays.ex1],
          data[cfg.arrays.ex2],
          data[cfg.arrays.ex3],
          data[cfg.arrays.ex4]
        )
      }
    })

    LABEL_IMPORT_CONFIG.forEach((cfg) => {
      const raw = data[cfg.dataKey]
      if (!raw) return
      setSkillLabel(cfg.category, cfg.key, `${cfg.prefix}（${raw}）`)
    })

    // After applying, update derived values via existing logic
    try { syncDerivedValues() } catch(e) {}
  }

  const syncDerivedValues = () => {
    const s = formData.value.status || {}

    // DEX -> combat.sc1.default
    const dex = Number(s.dex?.default) || 0
    try {
      if (formData.value.skill?.combat?.sc1 && typeof formData.value.skill.combat.sc1 === 'object') {
        formData.value.skill.combat.sc1.default = dex * 2
      }
    } catch (e) {}

    // POW -> idea, ini_san, mp, luck
    const pow = Number(s.pow?.default) || 0
    if (s.idea) s.idea.default = pow * 5
    if (s.ini_san) s.ini_san.default = pow * 5
    if (s.mp) s.mp.default = pow
    if (s.luck) s.luck.default = pow * 5

    // current SAN from ini_san when not provided by API
    try {
      if (!sanFromApi.value) {
        const ini = s.ini_san || {}
        const currentSan = (Number(ini.default) || 0) + (Number(ini.ex1) || 0) + (Number(ini.ex2) || 0)
        if (s.san) s.san.default = currentSan
      }
    } catch (e) {}

    // EDU -> KNOW and neg.sn5
    const edu = Number(s.edu?.default) || 0
    if (s.know) s.know.default = edu * 5
    try {
      if (formData.value.skill?.neg?.sn5 && typeof formData.value.skill.neg.sn5 === 'object') {
        formData.value.skill.neg.sn5.default = edu * 5
      }
    } catch (e) {}

    // HP = round((CON + SIZ) / 2)
    const con = Number(s.con?.default) || 0
    const siz = Number(s.siz?.default) || 0
    if (s.hp) s.hp.default = Math.round((con + siz) / 2)
  }

  // watchers to keep derived values updated
  watch(() => formData.value.status?.dex?.default, () => syncDerivedValues())
  watch(() => formData.value.status?.pow?.default, () => syncDerivedValues())
  watch(() => formData.value.status?.edu?.default, () => syncDerivedValues())
  watch(() => formData.value.status?.con?.default, () => syncDerivedValues())
  watch(() => formData.value.status?.siz?.default, () => syncDerivedValues())

  const setCropData = (d: any | null) => {
    cropData.value = d;
  };

  const reset = () => {
    formData.value = defaultForm();
    errors.value = {};
    imageFile.value = null;
    cropData.value = null;
    original.value = null;
    sanFromApi.value = false;
    // initialize skill defaults from investigatorInfo.skillDefaultList
    try {
      const base = (investigatorInfo as any).skillDefaultList || {};
      const skillObj: Record<string, any> = {};
      for (const [categoryKey, items] of Object.entries(base)) {
        const cat: Record<string, any> = {};
        for (const [skillKey, val] of Object.entries(items || {})) {
          if (Array.isArray(val)) {
            if (val.length >= 2) {
              cat[skillKey] = { label: String(val[0]), default: Number(val[1]) || 0, ex1: null, ex2: null, ex3: null, ex4: null };
            } else {
              // empty array placeholder for extra skills
              cat[skillKey] = [];
            }
          } else {
            cat[skillKey] = [];
          }
        }
        skillObj[categoryKey] = cat;
      }
      formData.value.skill = skillObj;
    } catch (e) {
      formData.value.skill = {};
    }
    syncDerivedValues()
  };

  const revertToOriginal = () => {
    if (!original.value) return
    formData.value = JSON.parse(JSON.stringify(original.value))
    sanFromApi.value = !!formData.value.status?.san?.default
    imageFile.value = null
    cropData.value = null
    syncDerivedValues()
    errors.value = {}
  };

  const normalizeSkillStructure = (skillInput: any) => {
    try {
      const base = (investigatorInfo as any).skillDefaultList || {};
      const out: Record<string, any> = {};
      for (const [categoryKey, defItems] of Object.entries(base)) {
        const src = skillInput?.[categoryKey];
        if (src == null) {
          // create from defaults
          const cat: Record<string, any> = {};
          for (const [k, v] of Object.entries(defItems || {})) {
            if (Array.isArray(v) && v.length >= 2) {
              cat[k] = { label: String(v[0]), default: Number(v[1]) || 0, ex1: 0, ex2: 0, ex3: 0, ex4: 0 };
            } else {
              cat[k] = [];
            }
          }
          out[categoryKey] = cat;
          continue;
        }

        // if src is an array, normalize each entry into object or keep array entries normalized
        if (Array.isArray(src)) {
          const arr = src.map((it: any) => {
            if (it == null) return { default: 0, ex1: 0, ex2: 0, ex3: 0, ex4: 0 };
            if (typeof it === 'number' || typeof it === 'string') {
              const n = Number(it) || 0;
              return { default: n, ex1: 0, ex2: 0, ex3: 0, ex4: 0 };
            }
            // object: ensure fields exist
            const outObj: any = {};
            outObj.label = it.label ?? it.name ?? '';
            outObj.default = Number(it.default ?? it.value ?? 0) || 0;
            outObj.ex1 = Number(it.ex1 ?? 0) || 0;
            outObj.ex2 = Number(it.ex2 ?? 0) || 0;
            outObj.ex3 = Number(it.ex3 ?? 0) || 0;
            outObj.ex4 = Number(it.ex4 ?? 0) || 0;
            return outObj;
          });
          out[categoryKey] = arr;
          continue;
        }

        // src is object (map)
        const catObj: Record<string, any> = {};
        for (const [k, v] of Object.entries(src)) {
          if (Array.isArray(v)) {
            // array like [label, default]
            if (v.length >= 2) {
              catObj[k] = { label: String(v[0]), default: Number(v[1]) || 0, ex1: 0, ex2: 0, ex3: 0, ex4: 0 };
            } else {
              catObj[k] = [];
            }
          } else if (v && typeof v === 'object') {
            // 型ガード: vがnullでなくobject
            catObj[k] = {
              label: (typeof (v as any).label === 'string' ? (v as any).label : (typeof (v as any).name === 'string' ? (v as any).name : '')),
              default: Number((v as any).default ?? (v as any).value ?? 0) || 0,
              ex1: Number((v as any).ex1 ?? 0) || 0,
              ex2: Number((v as any).ex2 ?? 0) || 0,
              ex3: Number((v as any).ex3 ?? 0) || 0,
              ex4: Number((v as any).ex4 ?? 0) || 0,
            };
          } else {
            const n = Number(v) || 0;
            catObj[k] = { default: n, ex1: 0, ex2: 0, ex3: 0, ex4: 0 };
          }
        }
        out[categoryKey] = catObj;
      }
      return out;
    } catch (e) {
      return skillInput;
    }
  };

  const fetchFromUrl = async () => {
    try {
      const rawUrl = String(formData.value.url || '').trim();
      if (!rawUrl) {
        errors.value.url = 'URLが空です';
        return { ok: false };
      }

      // Build targetUrl ensuring .json suffix when appropriate
      let targetUrl = rawUrl;
      const qIdx = rawUrl.indexOf('?');
      if (qIdx >= 0) {
        const base = rawUrl.slice(0, qIdx);
        const query = rawUrl.slice(qIdx);
        if (!base.toLowerCase().endsWith('.json')) targetUrl = base + '.json' + query;
      } else if (!rawUrl.toLowerCase().endsWith('.json')) {
        targetUrl = rawUrl + '.json';
      }

      const proxyUrl = `/api/proxy.php?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('fetch failed');
      const contentType = res.headers.get('content-type') || '';
      let json: any = null;
      if (contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const text = await res.text();
        try {
          json = text ? JSON.parse(text) : null;
        } catch (e) {
          throw new Error('invalid json from proxy');
        }
      }

      if (!json) throw new Error('no json');

      // Debug: log fetched JSON and proxy URL
      // debug logging intentionally disabled in production

      const fields = ['name', 'kana', 'age', 'job', 'feature', 'detail', 'url'];
      for (const k of fields) if (json[k]) formData.value[k] = json[k];

      // Additional common external key mappings
      const fieldCandidatesMap: Record<string, string[]> = {
        name: ['pc_name', 'name', 'pcname', 'player_name'],
        kana: ['kana', 'ふりがな'],
        age: ['age', 'pc_age'],
        job: ['shuzoku', 'job', '職業'],
        // do NOT map pc_making_memo to `feature` — API's pc_making_memo should go to `detail` only
        feature: ['message', 'feature'],
        detail: ['pc_making_memo', 'detail', 'memo'],
        url: ['url', 'source', 'link'],
      };
      const lookup = (obj: any, candidates: string[]) => {
        if (!obj) return null;
        for (const c of candidates) if (c in obj) return obj[c];
        if ('data' in obj && obj.data) for (const c of candidates) if (c in obj.data) return obj.data[c];
        if ('result' in obj && obj.result) for (const c of candidates) if (c in obj.result) return obj.result[c];
        return null;
      };
      for (const [targetKey, cand] of Object.entries(fieldCandidatesMap)) {
        const v = lookup(json, cand);
        if (v != null && !formData.value[targetKey]) formData.value[targetKey] = v;
      }

      // Helper to find candidate keys at top-level or under common wrappers
      const findKey = (obj: any, candidates: string[]) => {
        if (!obj) return null;
        for (const c of candidates) if (c in obj) return obj[c];
        if ('data' in obj && obj.data) {
          for (const c of candidates) if (c in obj.data) return obj.data[c];
        }
        if ('result' in obj && obj.result) {
          for (const c of candidates) if (c in obj.result) return obj.result[c];
        }
        return null;
      };

      const statusCandidates = ['status', 'statuses', '能力', 'ability', 'abilities', 'stats', 'statusList', 'status_list'];
      const skillCandidates = ['skill', 'skills', '技能', 'skillList', 'skill_list', 'skills_list'];

      const statusSource = findKey(json, statusCandidates);
      const skillSource = findKey(json, skillCandidates);

      // If no explicit status source, try NA1..NA14 or V_NA1..V_NA14 patterns
      const statusKeysOrder: StatusKey[] = ['str','con','pow','dex','app','siz','int','edu','hp','mp','ini_san','idea','luck','know','san'];
      if (!statusSource) {
        const detected: string[] = [];
        for (let i = 1; i <= 14; i++) {
          const k1 = `NA${i}`;
          const k2 = `V_NA${i}`;
          const v = (json as any)[k2] ?? (json as any)[k1] ?? null;
          detected.push(v == null ? '' : String(v));
        }
        const anyDetected = detected.some((x) => x !== '' && x !== null);
        if (anyDetected) {
          for (let i = 0; i < 14; i++) {
            const val = detected[i];
            const key = statusKeysOrder[i];
            if (!key) continue;
            const n = Number(val);
            if (!Number.isNaN(n)) {
              formData.value.status[key] = { ...(formData.value.status[key] || {}), default: n };
            }
          }
          // SAN handling (may be separate keys)
          const sanLeft = (json as any)['SAN_Left'] ?? (json as any)['SAN_Left'] ?? null;
          const sanMax = (json as any)['SAN_Max'] ?? null;
          if (sanLeft != null) formData.value.status['san'] = { ...(formData.value.status['san'] || {}), default: Number(sanLeft) || 0 };
          if (sanMax != null) formData.value.status['ini_san'] = { ...(formData.value.status['ini_san'] || {}), default: Number(sanMax) || 0 };
        }
      }

      if (statusSource) {
        try {
          const mapping: Record<string, string> = {};
          const src = (investigatorInfo as any).statusList || {};
          for (const [label, key] of Object.entries(src)) mapping[label] = key as string;
          const normMapping: Record<string, string> = {};
          for (const [lab, k] of Object.entries(mapping)) {
            normMapping[lab] = k;
            normMapping[lab.toLowerCase()] = k;
            normMapping[lab.toUpperCase()] = k;
          }

          for (const [extKey, val] of Object.entries(statusSource)) {
            const keyCandidates = [String(extKey), String(extKey).toLowerCase(), String(extKey).toUpperCase()];
            let internalKey: string | undefined = undefined;
            for (const c of keyCandidates) {
              if (normMapping[c]) {
                internalKey = normMapping[c];
                break;
              }
            }
            if (!internalKey) {
              if (extKey === 'san' || extKey === '現在SAN' || extKey === '現在san') internalKey = 'san';
              if (extKey === 'ini_san' || extKey === '初期SAN' || extKey === '初期san') internalKey = 'ini_san';
            }
            if (!internalKey) continue;

            const target = formData.value.status[internalKey] || { default: null, ex1: null, ex2: null };
            if (val == null) {
              // skip
            } else if (typeof val === 'object') {
              // 型ガード: default/value/ex1..ex4が存在する場合のみアクセス
              if ('default' in val || 'value' in val) {
                target.default = (val as any).default ?? (val as any).value ?? target.default;
              }
              if ('ex1' in val) target.ex1 = (val as any).ex1;
              if ('ex2' in val) target.ex2 = (val as any).ex2;
              if ('ex3' in val) target.ex3 = (val as any).ex3;
              if ('ex4' in val) target.ex4 = (val as any).ex4;
            } else {
              const n = Number(val);
              if (!Number.isNaN(n)) target.default = n;
            }
            formData.value.status[internalKey] = target;
          }
        } catch (e) {
          formData.value.status = { ...formData.value.status, ...(statusSource || {}) };
        }
      }

      if (skillSource) {
        formData.value.skill = normalizeSkillStructure(skillSource);
      }

      // If data resembles character storage API, apply full mapping
      if (statusSource || skillSource || json.pc_name || json.NA1) {
        applyApiData(json, rawUrl);
        syncDerivedValues();
      }

      return { ok: true };
    } catch (e: any) {
      errors.value.url = '外部URLから取得できませんでした';
      return { ok: false, error: e?.message };
    }
  };

  const setEditingId = async (id: string | number | null) => {
    editingId.value = id ? (typeof id === 'number' ? id : String(id)) : null
    if (!id) {
      reset();
      return;
    }
    const iid = String(id);
    const res = await adminInvestigatorDetail(iid);
    if (!(res as any)?.ok) {
      errors.value.fetch = (res as any)?.error || '取得エラー';
      return { ok: false };
    }
    const data = (res as any).data ?? {};
    // normalize parsed JSON fields
    if (data.status) data.status = data.status;
    if (data.skill) data.skill = normalizeSkillStructure(data.skill);
    formData.value = JSON.parse(JSON.stringify(data));
    original.value = JSON.parse(JSON.stringify(data));
    sanFromApi.value = !!formData.value.status?.san?.default
    syncDerivedValues()
    return { ok: true };
  };

  const submit = async () => {
    try {
      errors.value = {};
      const payload = { ...formData.value };
      // ensure feature is an array (split strings by newline, comma, or whitespace)
      if (payload.feature == null) {
        payload.feature = [];
      } else if (!Array.isArray(payload.feature)) {
        const raw = String(payload.feature || '').trim();
        if (!raw) {
          payload.feature = [];
        } else {
          payload.feature = raw
            .split(/[\r\n,、\s]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        }
      }
      if (imageFile.value) {
        const fd = new FormData();
        for (const k of Object.keys(payload)) {
          if (k === 'status' || k === 'skill' || k === 'feature') {
            fd.append(k, JSON.stringify(payload[k]));
          } else {
            fd.append(k, payload[k] ?? '');
          }
        }
        if (cropData.value) fd.append('crop', JSON.stringify(cropData.value));
        fd.append('image', imageFile.value);
        const res = payload.id ? await updateInvestigator(fd) : await addInvestigator(fd);
        if ((res as any)?.ok && !payload.id) {
          reset();
        }
        return res;
      } else {
        const res = payload.id ? await updateInvestigator(payload) : await addInvestigator(payload);
        if ((res as any)?.ok && !payload.id) {
          reset();
        }
        return res;
      }
    } catch (e: any) {
      return { ok: false, error: e?.message || 'submit error' };
    }
  };

  onMounted(() => {
    if (editId) setEditingId(editId);
  });

  return {
    formData,
    errors,
    submit,
    reset,
    fetchFromUrl,
    editingId,
    setEditingId,
    revertToOriginal,
    setImageFile,
    setCropData,
  };
}
