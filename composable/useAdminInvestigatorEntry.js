import { ref, watch } from 'vue';
import { addInvestigator, adminInvestigatorDetail, updateInvestigator } from '@/util/api.js';
import investigatorInfo from '@/assets/json/investigatorInfo.json';

// スキル初期値を生成
function initializeSkills() {
  const skill = {};
  if (investigatorInfo.skillDefaultList) {
    for (const [category, items] of Object.entries(investigatorInfo.skillDefaultList)) {
      skill[category] = {};
      for (const [key, item] of Object.entries(items)) {
        if (Array.isArray(item)) {
          // [label, value] 形式（通常技能）
          if (typeof item[0] === 'string' && typeof item[1] === 'number') {
            const [label, value] = item;
            skill[category][key] = {
              label,
              default: value,
              ex1: null,
              ex2: null,
              ex3: null,
              ex4: null,
            };
          } else {
            // [{name, value}, ...] 形式（その他技能）
            skill[category][key] = item.map((entry) => ({ ...entry }));
          }
        } else {
          // オブジェクト形式（既存のデータ） -> 正規化: {label, value} -> {label, default, ex*}
          if (item && item.label !== undefined && item.value !== undefined) {
            skill[category][key] = {
              label: item.label,
              default: item.value,
              ex1: item.ex1 ?? null,
              ex2: item.ex2 ?? null,
              ex3: item.ex3 ?? null,
              ex4: item.ex4 ?? null,
            };
          } else {
            skill[category][key] = item;
          }
        }
      }
    }
  }
  return skill;
}

export function useAdminInvestigatorEntry() {
  const editingId = ref(null);
  const originalData = ref(null);
  const sanFromApi = ref(false);
  const imageFile = ref(null);
  const cropData = ref(null);

  const makeStatus = (overrides = {}) => {
    const baseKeys = ['str', 'con', 'pow', 'dex', 'app', 'siz', 'int', 'edu'];
    const derivedKeys = ['hp', 'mp', 'ini_san', 'idea', 'luck', 'know'];
    const status = {};

    baseKeys.forEach((key) => {
      status[key] = { default: 0, ex1: null, ex2: null };
    });

    derivedKeys.forEach((key) => {
      status[key] = { default: null, ex1: null, ex2: null };
    });

    status.san = { default: null };

    Object.entries(overrides).forEach(([key, value]) => {
      status[key] = { ...status[key], ...value };
    });

    return status;
  };

  const formData = ref({
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
    status: makeStatus(),
    skill: initializeSkills(),
  });

  const errors = ref({});

  const normalizeFeature = (value) => {
    if (Array.isArray(value)) return value.join(',');
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.join(',');
      } catch (e) {
        return value;
      }
      return value;
    }
    return '';
  };

  const normalizeExtraSkill = (ex) => ({
    name: ex?.name ?? '',
    default: ex?.default ?? ex?.value ?? 0,
    ex1: ex?.ex1 ?? null,
    ex2: ex?.ex2 ?? null,
    ex3: ex?.ex3 ?? null,
    ex4: ex?.ex4 ?? null,
  });

  const normalizeSkillItem = (item) => {
    if (Array.isArray(item)) {
      return item.map((ex) => normalizeExtraSkill(ex));
    }
    if (item && typeof item === 'object') {
      if (item.label !== undefined) {
        return {
          label: item.label,
          default: item.default ?? item.value ?? 0,
          ex1: item.ex1 ?? null,
          ex2: item.ex2 ?? null,
          ex3: item.ex3 ?? null,
          ex4: item.ex4 ?? null,
        };
      }
      if (item.name !== undefined) {
        return normalizeExtraSkill(item);
      }
    }
    return item;
  };

  const normalizeSkills = (raw) => {
    const base = initializeSkills();
    if (!raw || typeof raw !== 'object') return base;
    const source = raw;
    Object.keys(source).forEach((category) => {
      if (!base[category]) base[category] = {};
      const items = source[category] || {};
      Object.keys(items).forEach((key) => {
        base[category][key] = normalizeSkillItem(items[key]);
      });
    });
    return base;
  };

  const normalizeStatus = (raw) => {
    const base = makeStatus();
    if (!raw || typeof raw !== 'object') return base;
    Object.keys(raw).forEach((key) => {
      if (!base[key]) {
        base[key] = raw[key];
      } else {
        base[key] = { ...base[key], ...raw[key] };
      }
    });
    return base;
  };

  const safeParse = (value, fallback) => {
    if (typeof value !== 'string') return value ?? fallback;
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  };

  const loadInvestigator = async (id) => {
    if (!id) return;
    try {
      const data = await adminInvestigatorDetail(id);
      if (!data || data?.error) {
        errors.value.api = data?.error || 'データ取得に失敗しました';
        return;
      }

      const statusRaw = safeParse(data.status, {}) || {};
      const skillRaw = safeParse(data.skill, {}) || {};

      formData.value = {
        name: data.name || '',
        fullname: data.fullname || '',
        kana: data.kana || '',
        age: data.age || '',
        sex: data.sex || '',
        height: data.height || '',
        job: data.job || '',
        pc_from: data.pc_from || '',
        feature: normalizeFeature(data.feature),
        detail: data.detail || '',
        url: data.url || '',
        status: normalizeStatus(statusRaw),
        skill: normalizeSkills(skillRaw),
      };

      sanFromApi.value = !!formData.value.status?.san?.default;
      originalData.value = JSON.parse(JSON.stringify(formData.value));
      imageFile.value = null;
      cropData.value = null;
      syncDerivedValues();
      errors.value = {};
    } catch (e) {
      console.error('load investigator error:', e);
      errors.value.api = 'データ取得に失敗しました';
    }
  };

  const validate = () => {
    const err = {};
    if (!formData.value.name?.trim()) err.name = '通称名は必須です';
    if (!formData.value.age?.trim()) err.age = '年齢は必須です';
    if (!formData.value.job?.trim()) err.job = '職業は必須です';
    errors.value = err;
    return !Object.keys(err).length;
  };

  // 派生値を同期する（DEX->回避、POW->IDEA/INI_SAN/MP/LUCK、EDU->KNOW、HP=(CON+SIZ)/2）
  const syncDerivedValues = () => {
    const s = formData.value.status;

    // DEX -> 回避 (combat.sc1)
    const dex = Number(s.dex?.default) || 0;
    try {
      if (
        formData.value.skill?.combat?.sc1 &&
        typeof formData.value.skill.combat.sc1 === 'object'
      ) {
        // 正規化後は default に値を入れる
        formData.value.skill.combat.sc1.default = dex * 2;
      }
    } catch (e) {
      // ignore
    }

    // POW -> IDEA, INI_SAN, MP, LUCK
    const pow = Number(s.pow?.default) || 0;
    if (s.idea) s.idea.default = pow * 5;
    if (s.ini_san) s.ini_san.default = pow * 5;
    if (s.mp) s.mp.default = pow;
    if (s.luck) s.luck.default = pow * 5;

    // 現在SAN（san）は初期SANの合計を使う（入力可能だが、ここで自動更新する）
    try {
      if (!sanFromApi.value) {
        const ini = s.ini_san || {};
        const currentSan =
          (Number(ini.default) || 0) + (Number(ini.ex1) || 0) + (Number(ini.ex2) || 0);
        if (s.san) s.san.default = currentSan;
      }
    } catch (e) {
      // ignore
    }
    // EDU -> KNOW
    const edu = Number(s.edu?.default) || 0;
    if (s.know) s.know.default = edu * 5;

    // EDU -> 母国語（neg.sn5）
    try {
      if (formData.value.skill?.neg?.sn5 && typeof formData.value.skill.neg.sn5 === 'object') {
        formData.value.skill.neg.sn5.default = edu * 5;
      }
    } catch (e) {
      // ignore
    }

    // HP -> (CON + SIZ) / 2
    const con = Number(s.con?.default) || 0;
    const siz = Number(s.siz?.default) || 0;
    if (s.hp) s.hp.default = Math.round((con + siz) / 2);
  };

  // ステータス変更を監視して派生値を更新
  watch(
    () => formData.value.status.dex.default,
    (v) => {
      syncDerivedValues();
    }
  );
  watch(
    () => formData.value.status.pow.default,
    (v) => {
      syncDerivedValues();
    }
  );
  watch(
    () => formData.value.status.edu.default,
    (v) => {
      syncDerivedValues();
    }
  );
  // CON/SIZ の変更でHPを再計算
  watch(
    () => formData.value.status.con.default,
    (v) => {
      syncDerivedValues();
    }
  );
  watch(
    () => formData.value.status.siz.default,
    (v) => {
      syncDerivedValues();
    }
  );

  // 初期化時に派生値を適用
  syncDerivedValues();

  const applyStatusValue = (key, value, field = 'default') => {
    if (!formData.value.status?.[key]) return;
    const num = Number(value);
    if (!Number.isNaN(num)) {
      formData.value.status[key][field] = num;
    }
  };

  const getSkillKeyOrder = (category, prefix) => {
    const items = formData.value.skill?.[category] || {};
    return Object.keys(items)
      .filter((k) => k.startsWith(prefix))
      .map((k) => ({
        key: k,
        num: Number(k.replace(prefix, '')),
      }))
      .filter((item) => Number.isFinite(item.num))
      .sort((a, b) => a.num - b.num)
      .map((item) => item.key);
  };

  const applySkillArray = (category, prefix, values, field) => {
    if (!Array.isArray(values)) return;
    const keys = getSkillKeyOrder(category, prefix);
    values.forEach((val, idx) => {
      const key = keys[idx];
      if (!key) return;
      const item = formData.value.skill?.[category]?.[key];
      if (!item || Array.isArray(item)) return;
      const num = Number(val);
      if (!Number.isNaN(num)) {
        item[field] = num;
      }
    });
  };

  const setSkillLabel = (category, key, value) => {
    const label = String(value || '').trim();
    if (!label) return;
    const item = formData.value.skill?.[category]?.[key];
    if (!item || Array.isArray(item)) return;
    item.label = label;
  };

  const SKILL_IMPORT_CONFIG = [
    {
      category: 'combat',
      prefix: 'sc',
      arrays: { ex1: 'TBAS', ex2: 'TBAK', ex3: 'TBAA', ex4: 'TBAO' },
      extraKey: 'scet',
      extraNames: ['TBAName', 'TBName'],
      extraDefaults: 'TBAD',
    },
    {
      category: 'exp',
      prefix: 'se',
      arrays: { ex1: 'TFAS', ex2: 'TFAK', ex3: 'TFAA', ex4: 'TFAO' },
      extraKey: 'seet',
      extraNames: ['TFAName', 'TFName'],
      extraDefaults: 'TFAD',
    },
    {
      category: 'act',
      prefix: 'sa',
      arrays: { ex1: 'TAAS', ex2: 'TAAK', ex3: 'TAAA', ex4: 'TAAO' },
      extraKey: 'saet',
      extraNames: ['TAAName', 'TAName'],
      extraDefaults: 'TAAD',
    },
    {
      category: 'neg',
      prefix: 'sn',
      arrays: { ex1: 'TCAS', ex2: 'TCAK', ex3: 'TCAA', ex4: 'TCAO' },
      extraKey: 'snet',
      extraNames: ['TCAName', 'TCName'],
      extraDefaults: 'TCAD',
    },
    {
      category: 'know',
      prefix: 'sk',
      arrays: { ex1: 'TKAS', ex2: 'TKAK', ex3: 'TKAA', ex4: 'TKAO' },
      extraKey: 'sket',
      extraNames: ['TKAName', 'TKName'],
      extraDefaults: 'TKAD',
    },
  ];

  const LABEL_IMPORT_CONFIG = [
    { category: 'act', key: 'sa1', dataKey: 'unten_bunya', prefix: '運転' },
    { category: 'act', key: 'sa6', dataKey: 'seisaku_bunya', prefix: '製作' },
    { category: 'act', key: 'sa7', dataKey: 'main_souju_norimono', prefix: '操縦' },
    { category: 'know', key: 'sk5', dataKey: 'geijutu_bunya', prefix: '芸術' },
    { category: 'neg', key: 'sn5', dataKey: 'mylang_name', prefix: '母国語' },
  ];

  const applyExtraSkillsFromApi = (category, extraKey, names, defaults, ex1s, ex2s, ex3s, ex4s) => {
    if (!Array.isArray(names) || !names.length) return;
    const items = formData.value.skill?.[category];
    if (!items || !Array.isArray(items[extraKey])) return;

    const count = names.length;
    const pickValue = (arr, idx) => {
      if (!Array.isArray(arr) || !arr.length) return 0;
      const baseIndex = Math.max(0, arr.length - count);
      const value = arr[baseIndex + idx];
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    };

    names.forEach((name, idx) => {
      const label = String(name || '').trim();
      if (!label) return;
      const payload = {
        name: label,
        default: pickValue(defaults, idx),
        ex1: pickValue(ex1s, idx),
        ex2: pickValue(ex2s, idx),
        ex3: pickValue(ex3s, idx),
        ex4: pickValue(ex4s, idx),
      };

      const existing = items[extraKey].find((item) => item?.name === label);
      if (existing) {
        existing.default = payload.default;
        existing.ex1 = payload.ex1;
        existing.ex2 = payload.ex2;
        existing.ex3 = payload.ex3;
        existing.ex4 = payload.ex4;
      } else {
        items[extraKey].push(payload);
      }
    });
  };

  const applyApiData = (data, sourceUrl) => {
    if (!data || typeof data !== 'object') return;

    formData.value.name = data.pc_name ?? data.name ?? formData.value.name;
    formData.value.age = data.age ?? formData.value.age;
    formData.value.sex = data.sex ?? formData.value.sex;
    const heightValue = data.pc_height;
    if (heightValue !== undefined && heightValue !== null) {
      const rawHeight = String(heightValue);
      const numericHeight = rawHeight.replace(/[^0-9.]/g, '');
      formData.value.height = numericHeight || formData.value.height;
    }
    formData.value.job = data.shuzoku ?? data.job ?? formData.value.job;
    formData.value.detail = data.pc_making_memo ?? data.detail ?? formData.value.detail;
    formData.value.url = sourceUrl || formData.value.url;

    applyStatusValue('str', data.NA1);
    applyStatusValue('con', data.NA2);
    applyStatusValue('pow', data.NA3);
    applyStatusValue('dex', data.NA4);
    applyStatusValue('app', data.NA5);
    applyStatusValue('siz', data.NA6);
    applyStatusValue('int', data.NA7);
    applyStatusValue('edu', data.NA8);
    applyStatusValue('hp', data.NA9);
    applyStatusValue('mp', data.NA10);
    applyStatusValue('ini_san', data.NA11);
    applyStatusValue('idea', data.NA12);
    applyStatusValue('luck', data.NA13);
    applyStatusValue('know', data.NA14);

    const statusOrder = [
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
    ];
    statusOrder.forEach((key, idx) => {
      const sIndex = idx + 1;
      applyStatusValue(key, data[`NS${sIndex}`], 'ex1');
      applyStatusValue(key, data[`NM${sIndex}`], 'ex2');
    });

    if (data.SAN_Left !== undefined && data.SAN_Left !== null) {
      applyStatusValue('san', data.SAN_Left);
      sanFromApi.value = true;
    }

    SKILL_IMPORT_CONFIG.forEach((cfg) => {
      Object.entries(cfg.arrays).forEach(([field, key]) => {
        applySkillArray(cfg.category, cfg.prefix, data[key], field);
      });

      const nameKey = cfg.extraNames.find((k) => Array.isArray(data[k]));
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
        );
      }
    });

    LABEL_IMPORT_CONFIG.forEach((cfg) => {
      const raw = data[cfg.dataKey];
      if (!raw) return;
      setSkillLabel(cfg.category, cfg.key, `${cfg.prefix}（${raw}）`);
    });

    syncDerivedValues();
  };

  const fetchFromUrl = async () => {
    const baseUrl = String(formData.value.url || '').trim();
    if (!baseUrl) {
      errors.value.api = 'URLを入力してください';
      return;
    }

    const apiUrl = baseUrl.endsWith('.js') ? baseUrl : `${baseUrl}.js`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      console.log('external api response:', data);
      applyApiData(data, baseUrl);
      errors.value.api = '';
    } catch (e) {
      console.error('external api fetch error:', e);
      errors.value.api = 'URLからの取得に失敗しました';
    }
  };

  const submit = async () => {
    console.log('formData:', formData.value);
    if (!validate()) return;

    try {
      // 派生値を同期し、幸運は POW*5 に固定
      syncDerivedValues();
      const powForLuck = Number(formData.value.status?.pow?.default) || 0;
      if (formData.value.status?.luck) {
        formData.value.status.luck.default = powForLuck * 5;
      }

      const statusPayload = (() => {
        const s = formData.value.status || {};
        const payload = {};
        Object.keys(s).forEach((key) => {
          payload[key] = s[key];
        });

        if ('san' in payload && 'ini_san' in payload) {
          const ordered = {};
          Object.keys(payload).forEach((key) => {
            if (key === 'ini_san') {
              ordered.san = payload.san;
            }
            if (key !== 'san') {
              ordered[key] = payload[key];
            }
          });
          return ordered;
        }

        return payload;
      })();

      const payload = {
        name: formData.value.name,
        fullname: formData.value.fullname,
        kana: formData.value.kana,
        age: formData.value.age,
        sex: formData.value.sex,
        height: formData.value.height,
        job: formData.value.job,
        pc_from: formData.value.pc_from,
        feature: formData.value.feature
          ? formData.value.feature.split(',').map((s) => s.trim())
          : [],
        detail: formData.value.detail,
        url: formData.value.url,
        status: statusPayload,
        skill: formData.value.skill,
      };

      const buildFormData = (data, file, id, crop) => {
        const fd = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value === undefined || value === null) {
            fd.append(key, '');
            return;
          }
          if (typeof value === 'object') {
            fd.append(key, JSON.stringify(value));
            return;
          }
          fd.append(key, String(value));
        });
        if (id) fd.append('id', String(id));
        if (file) fd.append('image', file);
        if (crop && file) fd.append('crop', JSON.stringify(crop));
        return fd;
      };

      const result = editingId.value
        ? await updateInvestigator(
            imageFile.value
              ? buildFormData(payload, imageFile.value, editingId.value, cropData.value)
              : { ...payload, id: editingId.value }
          )
        : await addInvestigator(
            imageFile.value
              ? buildFormData(payload, imageFile.value, null, cropData.value)
              : payload
          );

      if (result?.ok) {
        alert(editingId.value ? '更新しました' : '登録しました');
        reset();
        return true;
      } else {
        errors.value.api = result?.error || '登録に失敗しました';
      }
    } catch (e) {
      console.error('add investigator error:', e);
      errors.value.api = 'エラーが発生しました: ' + e.message;
    }
    return false;
  };

  const reset = () => {
    sanFromApi.value = false;
    editingId.value = null;
    originalData.value = null;
    imageFile.value = null;
    cropData.value = null;
    formData.value = {
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
      status: makeStatus({
        hp: { default: 10 },
        mp: { default: 10 },
        ini_san: { default: 10 },
        san: { default: 10 },
        idea: { default: 10 },
        luck: { default: 10 },
        know: { default: 10 },
      }),
      skill: initializeSkills(),
    };
    // リセット後に派生値を同期
    syncDerivedValues();
    errors.value = {};
  };

  const setEditingId = async (id) => {
    editingId.value = id ? Number(id) : null;
    if (editingId.value) {
      await loadInvestigator(editingId.value);
    } else {
      originalData.value = null;
      imageFile.value = null;
      cropData.value = null;
    }
  };

  const revertToOriginal = () => {
    if (!originalData.value) return;
    formData.value = JSON.parse(JSON.stringify(originalData.value));
    sanFromApi.value = !!formData.value.status?.san?.default;
    imageFile.value = null;
    cropData.value = null;
    syncDerivedValues();
    errors.value = {};
  };

  const setImageFile = (file) => {
    imageFile.value = file || null;
  };

  const setCropData = (data) => {
    cropData.value = data || null;
  };

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
