<template>
  <div class="container">
    <h2 class="title">探索者管理</h2>
    <div class="controls">
      <div class="control-item">
        <label class="control-label">並び替え</label>
        <BaseSelect v-model="sortType" class="control-select">
          <option value="created">作成順</option>
          <option value="age">年齢</option>
          <option value="height">身長</option>
          <option value="status">ステータス</option>
          <option value="skill">技能値</option>
        </BaseSelect>
        <BaseSelect v-if="sortType === 'status'" v-model="sortKey" class="control-select">
          <option v-for="opt in statusSortOptions" :key="opt.key" :value="opt.key">
            {{ opt.label }}
          </option>
        </BaseSelect>
        <BaseSelect v-if="sortType === 'skill'" v-model="skillCategory" class="control-select">
          <option v-for="opt in skillCategoryOptions" :key="opt.key" :value="opt.key">
            {{ opt.label }}
          </option>
        </BaseSelect>
        <BaseSelect v-if="sortType === 'skill'" v-model="sortKey" class="control-select">
          <option v-for="opt in skillSortOptions" :key="opt.key" :value="opt.key">
            {{ opt.label }}
          </option>
        </BaseSelect>
        <BaseSelect v-model="sortOrder" class="control-select">
          <option value="desc">降順</option>
          <option value="asc">昇順</option>
        </BaseSelect>
        <BaseInput
          v-if="showMinFilter"
          v-model.number="minFilter"
          type="number"
          class="control-input"
          placeholder="以上で絞り込み"
        />
      </div>
      <div class="control-item">
        <label class="control-label">性別</label>
        <BaseSelect v-model="sexFilter" class="control-select">
          <option value="all">すべて</option>
          <option value="male">男</option>
          <option value="female">女</option>
          <option value="other">その他</option>
        </BaseSelect>
      </div>
    </div>
    <table class="main-table">
      <thead>
        <tr>
          <th class="th-id">ID</th>
          <th class="th-name">通称名</th>
          <th class="th-data">データ</th>
          <th class="th-action">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inv in displayedList" :key="inv.id">
          <!-- ID -->
          <td class="cell cell-id">{{ inv.id }}</td>

          <!-- 名前 -->
          <td class="cell cell-name">
            <div class="thumb-box">
              <img
                v-if="!isThumbMissing(inv.id)"
                :src="getThumbUrl(inv.id)"
                class="thumb-img"
                @error="onThumbError(inv.id)"
              />
              <span v-else class="thumb-placeholder">NO IMAGE</span>
            </div>
            <div class="name-text">{{ inv.name }}</div>
          </td>

          <!-- データ -->
          <td class="cell cell-data">
            <div class="data-scroll">
              <!-- プロフィール -->
              <table class="section-table">
                <details class="section-details">
                  <summary class="section-summary">プロフィール</summary>
                  <tbody>
                    <tr>
                      <td class="cell">正式名</td>
                      <td class="cell">{{ inv.fullname || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="cell">フリガナ</td>
                      <td class="cell">{{ inv.kana || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="cell">年齢</td>
                      <td class="cell">{{ inv.age }}</td>
                    </tr>
                    <tr>
                      <td class="cell">性別</td>
                      <td class="cell">{{ inv.sex }}</td>
                    </tr>
                    <tr>
                      <td class="cell">身長</td>
                      <td class="cell">{{ inv.height }}</td>
                    </tr>
                    <tr>
                      <td class="cell">職業</td>
                      <td class="cell">{{ inv.job }}</td>
                    </tr>
                    <tr>
                      <td class="cell">出身シナリオ</td>
                      <td class="cell">{{ inv.pc_from || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="cell">特徴表</td>
                      <td class="cell text-wrap">{{ parseFeature(inv.feature) }}</td>
                    </tr>
                    <tr>
                      <td class="cell">詳細</td>
                      <td class="cell">
                        <div class="detail-box">
                          {{ inv.detail }}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td class="cell">URL</td>
                      <td class="cell text-wrap">
                        <a
                          v-if="inv.url"
                          :href="inv.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          >{{ inv.url }}</a
                        >
                        <span v-else>-</span>
                      </td>
                    </tr>
                    <tr>
                      <td class="cell">登録日</td>
                      <td class="cell">
                        <div class="created-at-row">
                          <BaseInput
                            v-model="inv.created_at"
                            class="input-small"
                            placeholder="YYYYMMDD"
                          />
                          <BaseButton variant="primary" size="sm" @click="doUpdateCreatedAt(inv)"
                            >保存</BaseButton
                          >
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </details>
              </table>

              <!-- ステータス -->
              <table class="section-table">
                <details class="section-details">
                  <summary class="section-summary">ステータス</summary>
                  <tbody>
                    <tr>
                      <td colspan="2" class="cell">
                        <div class="table-scroll">
                          <table class="inner-table">
                            <thead>
                              <tr>
                                <!-- 見出し -->
                                <th
                                  v-for="item in statusDisplay"
                                  :key="'h-' + item.key"
                                  class="table-head"
                                >
                                  {{ item.label }}
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              <tr>
                                <!-- 値 -->
                                <td
                                  v-for="item in statusDisplay"
                                  :key="'v-' + item.key"
                                  class="table-cell"
                                >
                                  <template v-if="item.key === 'san'">
                                    <!-- san は DB から来る場合はそれを使い、なければ ini_san の合計を計算 -->
                                    <div>
                                      {{
                                        Number(inv.status?.san?.default) ||
                                          ((Number(inv.status?.ini_san?.default) || 0) +
                                            (Number(inv.status?.ini_san?.ex1) || 0) +
                                            (Number(inv.status?.ini_san?.ex2) || 0))
                                      }}
                                    </div>
                                  </template>
                                  <template v-else>
                                    {{
                                      (Number(inv.status[item.key]?.default) || 0) +
                                      (Number(inv.status[item.key]?.ex1) || 0) +
                                      (Number(inv.status[item.key]?.ex2) || 0)
                                    }}
                                    <br />
                                    <span
                                      class="muted"
                                      v-if="inv.status[item.key] && item.key !== 'san'"
                                    >
                                      （基礎値：{{ inv.status[item.key].default ?? 0 }}）
                                    </span>
                                  </template>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </details>
              </table>

              <!-- 技能 -->
              <table class="section-table">
                <details class="section-details">
                  <summary class="section-summary">技能値</summary>

                  <tbody>
                    <!-- 技能カテゴリごと -->
                    <tr v-for="(categoryKey, categoryLabel) in skillList" :key="categoryKey">
                      <td class="cell cell-compact">
                        <details class="section-details">
                          <summary class="section-summary">
                            {{ categoryLabel }}
                          </summary>

                          <div class="table-scroll">
                            <table class="inner-table inner-table--spaced">
                              <!-- 見出し -->
                              <thead>
                                <tr>
                                  <template
                                    v-for="(item, i) in inv.skill?.[categoryKey] ?? []"
                                    :key="categoryKey + '-h-' + i"
                                  >
                                    <!-- 通常技能 -->
                                    <th v-if="item && item.label !== undefined" class="table-head">
                                      {{ item.label }}
                                    </th>
                                    <!-- 追加技能 -->
                                    <template v-else-if="Array.isArray(item) && item.length > 0">
                                      <th
                                        v-for="(ex, exIndex) in item"
                                        :key="categoryKey + '-h-ex-' + i + '-' + exIndex"
                                        class="table-head"
                                      >
                                        {{ ex.name }}
                                      </th>
                                    </template>
                                  </template>
                                </tr>
                              </thead>

                              <!-- 値 -->
                              <tbody>
                                <tr>
                                  <template
                                    v-for="(item, i) in inv.skill?.[categoryKey] ?? []"
                                    :key="categoryKey + '-v-' + i"
                                  >
                                    <!-- 通常技能 -->
                                    <th
                                      v-if="item && item.default !== undefined"
                                      class="table-cell"
                                    >
                                      {{ getSkillTotal(item) }}
                                    </th>
                                    <!-- 追加技能 -->
                                    <template v-else-if="Array.isArray(item) && item.length > 0">
                                      <th
                                        v-for="(ex, exIndex) in item"
                                        :key="categoryKey + '-v-ex-' + i + '-' + exIndex"
                                        class="table-cell"
                                      >
                                        {{ getSkillTotal(ex) }}
                                      </th>
                                    </template>
                                  </template>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </details>
                      </td>
                    </tr>
                  </tbody>
                </details>
              </table>
            </div>
          </td>

          <!-- 操作 -->
          <td class="cell cell-action">
            <div class="action-stack">
              <BaseButton
                variant="secondary"
                title="ステータスと技能値のみ更新されます"
                @click="doUpdateFromStorage(inv)"
                >保管所から更新</BaseButton
              >
              <BaseButton
                variant="primary"
                title="登録画面を開きます"
                @click="doEditInvestigator(inv.id)"
                >手動で修正</BaseButton
              >
              <BaseButton
                variant="primary"
                title="OGP用の画像を設定します"
                @click="openTrimModal(inv)"
                >OGP画像設定</BaseButton
              >
              <BaseButton
                variant="danger"
                title="一度削除すると戻せません"
                @click="doDeleteInvestigator(inv.id)"
                >DBから削除</BaseButton
              >
              <BaseButton
                variant="copy"
                title="ココフォリア用の駒を生成します"
                @click="copyToken(inv)"
                >駒をコピー</BaseButton
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 探索者 OGP トリミングモーダル -->
    <div v-if="showTrimModal" class="modal-overlay" @click.self="closeTrimModal">
      <div class="modal-content">
        <h3>OGP画像設定（探索者）</h3>
        <div class="trim-container">
          <canvas ref="trimCanvas" class="trim-canvas"></canvas>
        </div>
        <div class="trim-controls">
          <BaseButton variant="primary" @click="saveTrimmedImage" :disabled="isSavingOgp">
            保存
          </BaseButton>
          <BaseButton variant="secondary" @click="closeTrimModal">キャンセル</BaseButton>
        </div>
        <p class="trim-hint">画像をドラッグ・ホイールで位置と拡大率を調整してください（2:1 比率）</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
const DEV_LOG = import.meta.env.DEV;
import { useRouter } from 'vue-router';
import { useAdminInvestigators } from '@/composable/useAdminInvestigators';
import { useAdminInvestigatorEntry } from '@/composable/useAdminInvestigatorEntry';
import { INVESTIGATOR_BASE, uploadInvestigatorOgpImage } from '@/util/api';
import investigatorInfo from '@/assets/json/investigatorInfo.json';
import BaseButton from '@/src/components/ui/BaseButton.vue';
import BaseInput from '@/src/components/ui/BaseInput.vue';
import BaseSelect from '@/src/components/ui/BaseSelect.vue';
import {
  toNumber,
  toDateNumber,
  isMale,
  isFemale,
  parseFeature,
  getSkillTotal,
} from '@/composable/useInvestigatorUtils';

const { list, refresh, remove, updateCreatedAt } = useAdminInvestigators();
const router = useRouter();
const brokenThumbs = ref({});
const thumbVersion = ref(0);
const { setEditingId, fetchFromUrl, submit, formData, errors } = useAdminInvestigatorEntry();

const sortType = ref('created');
const sortOrder = ref('desc');
const sortKey = ref('str');
const skillCategory = ref('combat');
const minFilter = ref(null);
const sexFilter = ref('all');

// JSONから取得
const skillList = investigatorInfo.skillList;

// statusList に '現在SAN'(san) を ini_san の前に挿入した配列を作る
const statusDisplay = computed(() => {
  const arr = [];
  for (const [label, key] of Object.entries(investigatorInfo.statusList)) {
    if (key === 'ini_san') {
      arr.push({ label: '現在SAN', key: 'san' });
    }
    arr.push({ label, key });
  }
  return arr;
});

const statusSortOptions = computed(() =>
  statusDisplay.value.map((item) => ({ key: item.key, label: item.label }))
);

// categoryLabelMap is available via investigatorInfo.skillList when needed

const skillSortOptions = computed(() => {
  const result = [];
  const base = investigatorInfo.skillDefaultList || {};
  const items = base?.[skillCategory.value] || {};
  for (const [skillKey, val] of Object.entries(items || {})) {
    if (!Array.isArray(val) || val.length < 2) continue;
    const label = `${val[0]}`;
    result.push({ key: skillKey, label });
  }
  return result;
});

const defaultSkillKeysMap = computed(() => {
  const map: Record<string, any> = {};
  const base = investigatorInfo.skillDefaultList || {};
  for (const [categoryKey, items] of Object.entries(base as Record<string, any>)) {
    map[categoryKey] = Object.keys(items || {}).filter(
      (k) => Array.isArray(items[k]) && items[k].length >= 2
    );
  }
  return map;
});

const skillLabelMap = computed(() => {
  const map: Record<string, Record<string, string>> = {};
  const base = investigatorInfo.skillDefaultList || {};
  for (const [categoryKey, items] of Object.entries(base as Record<string, any>)) {
    map[categoryKey] = {};
    for (const [skillKey, val] of Object.entries(items || {})) {
      if (!Array.isArray(val) || val.length < 2) continue;
      map[categoryKey][skillKey] = val[0];
    }
  }
  return map;
});

watch(
  sortType,
  (type) => {
    if (type === 'status') {
      const first = statusSortOptions.value?.[0]?.key;
      if (first) sortKey.value = first;
    }
    if (type === 'skill') {
      const firstCategory = skillCategoryOptions.value?.[0]?.key;
      if (firstCategory) skillCategory.value = firstCategory;
      const firstSkill = skillSortOptions.value?.[0]?.key;
      if (firstSkill) sortKey.value = firstSkill;
    }
  },
  { immediate: true }
);

watch(
  skillCategory,
  () => {
    const firstSkill = skillSortOptions.value?.[0]?.key;
    if (firstSkill) sortKey.value = firstSkill;
  },
  { immediate: true }
);

const showMinFilter = computed(() => sortType.value === 'status' || sortType.value === 'skill');

const getCreatedValue = (inv) => {
  const dateVal = toDateNumber(inv?.created_at);
  if (dateVal !== null) return dateVal;
  return toNumber(inv?.id);
};

const getStatusValue = (inv, key) => {
  if (!key) return null;
  if (key === 'san') {
    const s = inv?.status || {};
    const ini = s?.ini_san || {};
    const base = toNumber(ini?.default ?? ini?.value) || 0;
    const ex1 = toNumber(ini?.ex1) || 0;
    const ex2 = toNumber(ini?.ex2) || 0;
    return base + ex1 + ex2;
  }
  return toNumber(inv?.status?.[key]?.default ?? inv?.status?.[key]?.value);
};

const getSkillItem = (inv, categoryKey, skillKey) => {
  const category = inv?.skill?.[categoryKey];
  if (!category || !skillKey) return null;
  if (Array.isArray(category)) {
    const keys = defaultSkillKeysMap.value?.[categoryKey] || [];
    const idx = keys.indexOf(skillKey);
    if (idx >= 0) return category[idx];
    const label = skillLabelMap.value?.[categoryKey]?.[skillKey];
    if (label) {
      return category.find((item) => item?.label === label || item?.name === label) || null;
    }
    return null;
  }
  if (typeof category === 'object') {
    if (category?.[skillKey] !== undefined) return category?.[skillKey];
    const label = skillLabelMap.value?.[categoryKey]?.[skillKey];
    if (label) {
      const items = Object.values(category);
      return items.find((item) => item?.label === label || item?.name === label) || null;
    }
  }
  return null;
};

const getSkillValue = (inv, categoryKey, skillKey) => {
  if (!categoryKey || !skillKey) return null;
  const item = getSkillItem(inv, categoryKey, skillKey);
  if (item && typeof item === 'object') {
    const base = toNumber(item.default ?? item.value) || 0;
    const ex1 = toNumber(item.ex1) || 0;
    const ex2 = toNumber(item.ex2) || 0;
    const ex3 = toNumber(item.ex3) || 0;
    const ex4 = toNumber(item.ex4) || 0;
    return base + ex1 + ex2 + ex3 + ex4;
  }
  return toNumber(item);
};

const getSortValue = (inv) => {
  if (sortType.value === 'created') return getCreatedValue(inv);
  if (sortType.value === 'age') return toNumber(inv?.age);
  if (sortType.value === 'height') return toNumber(inv?.height);
  if (sortType.value === 'status') return getStatusValue(inv, sortKey.value);
  if (sortType.value === 'skill') return getSkillValue(inv, skillCategory.value, sortKey.value);
  return null;
};

const displayedList = computed(() => {
  const items = [...(list.value || [])];
  const order = sortOrder.value === 'asc' ? 1 : -1;
  const minVal = toNumber(minFilter.value);
  const minFiltered =
    minVal === null || !showMinFilter.value
      ? items
      : items.filter((inv) => {
          const v = getSortValue(inv);
          return v !== null && v >= minVal;
        });
  const sexFiltered =
    sexFilter.value === 'all'
      ? minFiltered
      : minFiltered.filter((inv) => {
          if (sexFilter.value === 'male') return isMale(inv.sex);
          if (sexFilter.value === 'female') return isFemale(inv.sex);
          return !isMale(inv.sex) && !isFemale(inv.sex);
        });
  return sexFiltered.sort((a, b) => {
    const av = getSortValue(a);
    const bv = getSortValue(b);
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    if (av === bv) return 0;
    return av > bv ? order : -order;
  });
});

const assetsBase = import.meta.env.BASE_URL || '/';
const getThumbUrl = (id) =>
  `${assetsBase}assets/img/investigator/thumb/${id}.png?v=${thumbVersion.value}`;
const isThumbMissing = (id) => !!brokenThumbs.value?.[id];
const onThumbError = (id) => {
  brokenThumbs.value = { ...brokenThumbs.value, [id]: true };
};

const getStatusCurrent = (inv, key) => {
  if (!key) return 0;
  if (key === 'san') return getStatusValue(inv, 'san') || 0;
  const s = inv?.status?.[key] || {};
  const base = toNumber(s?.default ?? s?.value) || 0;
  const ex1 = toNumber(s?.ex1) || 0;
  const ex2 = toNumber(s?.ex2) || 0;
  return base + ex1 + ex2;
};

const getStatusBase = (inv, key) => {
  const s = inv?.status?.[key] || {};
  return toNumber(s?.default ?? s?.value) || 0;
};

const getDamageBonus = (inv) => {
  const str = getStatusBase(inv, 'str') || 0;
  const siz = getStatusBase(inv, 'siz') || 0;
  const total = str + siz;

  if (total >= 2 && total <= 12) return '-1d6';
  if (total >= 13 && total <= 16) return '-1d4';
  if (total >= 17 && total <= 24) return '0';
  if (total >= 25 && total <= 32) return '+1d4';
  if (total >= 33 && total <= 40) return '+1d6';
  if (total >= 41 && total <= 46) return '+2d6';
  if (total >= 57 && total <= 72) return '+3d6';
  if (total >= 73 && total <= 88) return '+4d6';

  return '0';
};

const buildSkillCommands = (inv) => {
  const commands = [];
  const defaultList = investigatorInfo.skillDefaultList || {};

  for (const [categoryKey, items] of Object.entries(defaultList)) {
    // デフォルト技能
    for (const [skillKey, def] of Object.entries(items || {})) {
      if (!Array.isArray(def) || def.length < 2) continue;
      const item = getSkillItem(inv, categoryKey, skillKey);
      const label = (item?.label ?? def?.[0] ?? '').trim();
      const total = item ? getSkillTotal(item) : null;
      if (total !== null && total !== undefined) {
        commands.push(`CCB<=${total} ${label || '（）'}`);
      }
    }

    // 追加技能（配列）
    const category = inv?.skill?.[categoryKey];
    if (category && typeof category === 'object' && !Array.isArray(category)) {
      for (const value of Object.values(category)) {
        if (!Array.isArray(value)) continue;
        value.forEach((ex) => {
          const label = String(ex?.name ?? '').trim();
          const total = getSkillTotal(ex);
          commands.push(`CCB<=${total} ${label || '（）'}`);
        });
      }
    } else if (Array.isArray(category)) {
      category.forEach((ex) => {
        const label = String(ex?.name ?? ex?.label ?? '').trim();
        const total = getSkillTotal(ex);
        commands.push(`CCB<=${total} ${label || '（）'}`);
      });
    }
  }

  return commands;
};

const buildCopyData = (inv) => {
  const hp = getStatusCurrent(inv, 'hp');
  const mp = getStatusCurrent(inv, 'mp');
  const san = getStatusCurrent(inv, 'san');
  const str = getStatusCurrent(inv, 'str');
  const con = getStatusCurrent(inv, 'con');
  const pow = getStatusCurrent(inv, 'pow');
  const dex = getStatusCurrent(inv, 'dex');
  const app = getStatusCurrent(inv, 'app');
  const siz = getStatusCurrent(inv, 'siz');
  const intVal = getStatusCurrent(inv, 'int');
  const edu = getStatusCurrent(inv, 'edu');
  const luck = getStatusCurrent(inv, 'luck');
  const idea = getStatusCurrent(inv, 'idea');
  const know = getStatusCurrent(inv, 'know');
  const db = getDamageBonus(inv);

  const commands = [
    '1D100<={SAN} 正気度ロール',
    `CCB<=${luck} 幸運`,
    'CCB<={STR}*5 STR×5',
    'CCB<={CON}*5 CON×5',
    'CCB<={POW}*5 POW×5',
    'CCB<={DEX}*5 DEX×5',
    'CCB<={APP}*5 APP×5',
    'CCB<={SIZ}*5 SIZ×5',
    'CCB<={INT}*5 INT×5',
    `CCB<=${idea} アイデア`,
    `CCB<=${know} 知識`,
    ...buildSkillCommands(inv),
  ];

  return {
    kind: 'character',
    data: {
      name: inv?.name ?? '',
      initiative: dex,
      externalUrl: inv?.url ?? '',
      status: [
        { label: 'HP', value: hp, max: hp },
        { label: 'MP', value: mp, max: mp },
        { label: 'SAN', value: san, max: san },
      ],
      params: [
        { label: 'STR', value: String(str) },
        { label: 'CON', value: String(con) },
        { label: 'POW', value: String(pow) },
        { label: 'DEX', value: String(dex) },
        { label: 'APP', value: String(app) },
        { label: 'SIZ', value: String(siz) },
        { label: 'INT', value: String(intVal) },
        { label: 'EDU', value: String(edu) },
        { label: 'DB', value: String(db) },
      ],
      commands: commands.join('\n'),
      memo: '',
    },
  };
};

const copyToken = async (inv) => {
  try {
    const payload = JSON.stringify(buildCopyData(inv));
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload);
      alert('コピーしました');
      return;
    }
    const el = document.createElement('textarea');
    el.value = payload;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('コピーしました');
  } catch (e) {
    if (DEV_LOG) console.error('copy token error:', e);
    alert('コピーに失敗しました');
  }
};

const doDeleteInvestigator = async (id) => {
  if (!id) return;
  try {
    const result = await remove(id);
    if (result?.ok) {
      await refresh();
      return;
    }
    alert(result?.error || '削除に失敗しました');
  } catch (e) {
    if (DEV_LOG) console.error('delete investigator error:', e);
    alert('削除に失敗しました');
  }
};

const doEditInvestigator = (id) => {
  if (!id) return;
  router.push({ path: `/admin/entry/${id}` });
};

const doUpdateFromStorage = async (inv) => {
  if (!inv?.id) return;
  if (!confirm('キャラクター保管所のデータから上書きしますか？')) return;
  try {
    await setEditingId(inv.id);
    const preserved = {
      name: formData.value.name,
      fullname: formData.value.fullname,
      kana: formData.value.kana,
      age: formData.value.age,
      sex: formData.value.sex,
      height: formData.value.height,
      job: formData.value.job,
      pc_from: formData.value.pc_from,
      feature: formData.value.feature,
      detail: formData.value.detail,
      url: formData.value.url,
    };
    const url = String(formData.value.url || '').trim();
    if (!url) {
      alert('URLがありません');
      return;
    }
    await fetchFromUrl();
    if (errors.value?.api) {
      alert(errors.value.api);
      return;
    }
    formData.value.name = preserved.name;
    formData.value.fullname = preserved.fullname;
    formData.value.kana = preserved.kana;
    formData.value.age = preserved.age;
    formData.value.sex = preserved.sex;
    formData.value.height = preserved.height;
    formData.value.job = preserved.job;
    formData.value.pc_from = preserved.pc_from;
    formData.value.feature = preserved.feature;
    formData.value.detail = preserved.detail;
    formData.value.url = preserved.url;
    const ok = await submit();
    if (ok) {
      await refresh();
      brokenThumbs.value = {};
      thumbVersion.value += 1;
      return;
    }
    alert(errors.value?.api || '更新に失敗しました');
  } catch (e) {
    if (DEV_LOG) console.error('update from storage error:', e);
    alert('更新に失敗しました');
  }
};

const doUpdateCreatedAt = async (inv) => {
  if (!inv?.id) return;
  try {
    const result = await updateCreatedAt(inv.id, inv.created_at ?? '');
    if (result?.ok) {
      await refresh();
      brokenThumbs.value = {};
      thumbVersion.value += 1;
      return;
    }
    alert(result?.error || '登録日の更新に失敗しました');
  } catch (e) {
    if (DEV_LOG) console.error('update created_at error:', e);
    alert('登録日の更新に失敗しました');
  }
};

// -------------------------
// 探索者 OGP トリミング用 state & 関数
// -------------------------
const showTrimModal = ref(false);
const currentTrimInv = ref<any | null>(null);
const trimCanvas = ref<HTMLCanvasElement | null>(null);
const trimCtx = ref<CanvasRenderingContext2D | null>(null);
const trimImage = ref<HTMLImageElement | null>(null);
const imageScale = ref(1);
const imageOffsetX = ref(0);
const imageOffsetY = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const isSavingOgp = ref(false);

const TRIM_WIDTH = 800;
const TRIM_HEIGHT = 400; // 2:1 ratio (width:height)
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

const drawTrimCanvas = () => {
  const ctx = trimCtx.value;
  const img = trimImage.value;
  if (!ctx || !img) return;

  ctx.clearRect(0, 0, TRIM_WIDTH, TRIM_HEIGHT);
  ctx.drawImage(
    img,
    imageOffsetX.value,
    imageOffsetY.value,
    img.width * imageScale.value,
    img.height * imageScale.value
  );

  ctx.strokeStyle = '#00f';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, TRIM_WIDTH, TRIM_HEIGHT);
};

const constrainImagePosition = () => {
  const img = trimImage.value;
  if (!img) return;

  const imgWidth = img.width * imageScale.value;
  const imgHeight = img.height * imageScale.value;

  if (imgWidth < TRIM_WIDTH) {
    imageOffsetX.value = (TRIM_WIDTH - imgWidth) / 2;
  } else {
    imageOffsetX.value = Math.min(0, Math.max(TRIM_WIDTH - imgWidth, imageOffsetX.value));
  }

  if (imgHeight < TRIM_HEIGHT) {
    imageOffsetY.value = (TRIM_HEIGHT - imgHeight) / 2;
  } else {
    imageOffsetY.value = Math.min(0, Math.max(TRIM_HEIGHT - imgHeight, imageOffsetY.value));
  }
};

const onTrimMouseDown = (e: MouseEvent) => {
  if (!trimCanvas.value) return;
  isDragging.value = true;
  const rect = trimCanvas.value.getBoundingClientRect();
  dragStartX.value = e.clientX - rect.left - imageOffsetX.value;
  dragStartY.value = e.clientY - rect.top - imageOffsetY.value;
};

const onTrimMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !trimCanvas.value) return;
  const rect = trimCanvas.value.getBoundingClientRect();
  imageOffsetX.value = e.clientX - rect.left - dragStartX.value;
  imageOffsetY.value = e.clientY - rect.top - dragStartY.value;
  constrainImagePosition();
  drawTrimCanvas();
};

const onTrimMouseUp = () => {
  isDragging.value = false;
};

const onTrimWheel = (e: WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY;
  const scaleChange = delta > 0 ? 0.9 : 1.1;
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, imageScale.value * scaleChange));

  const img = trimImage.value;
  const canvas = trimCanvas.value;
  if (!img || !canvas) {
    imageScale.value = newScale;
    constrainImagePosition();
    drawTrimCanvas();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const prevWidth = img.width * imageScale.value;
  const prevHeight = img.height * imageScale.value;
  const newWidth = img.width * newScale;
  const newHeight = img.height * newScale;

  const relX = (mouseX - imageOffsetX.value) / prevWidth;
  const relY = (mouseY - imageOffsetY.value) / prevHeight;

  imageScale.value = newScale;
  imageOffsetX.value = mouseX - relX * newWidth;
  imageOffsetY.value = mouseY - relY * newHeight;

  constrainImagePosition();
  drawTrimCanvas();
};

const openTrimModal = async (inv: any) => {
  if (!inv?.id) return;
  currentTrimInv.value = inv;
  showTrimModal.value = true;

  await nextTick();

  const canvas = trimCanvas.value;
  if (!canvas) return;

  canvas.width = TRIM_WIDTH;
  canvas.height = TRIM_HEIGHT;
  trimCtx.value = canvas.getContext('2d');

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      trimImage.value = img;

      const scaleX = TRIM_WIDTH / img.width;
      const scaleY = TRIM_HEIGHT / img.height;
      imageScale.value = Math.min(scaleX, scaleY);

      constrainImagePosition();
      drawTrimCanvas();
    };
    img.onerror = (e) => {
      if (DEV_LOG) console.error('investigator OGP image load error:', e);
      alert('画像の読み込みに失敗しました');
      closeTrimModal();
    };

    img.src = `${INVESTIGATOR_BASE}?mode=investigator_image&id=${encodeURIComponent(inv.id)}`;

    canvas.addEventListener('mousedown', onTrimMouseDown);
    canvas.addEventListener('mousemove', onTrimMouseMove);
    canvas.addEventListener('mouseup', onTrimMouseUp);
    canvas.addEventListener('mouseleave', onTrimMouseUp);
    canvas.addEventListener('wheel', onTrimWheel, { passive: false });
  } catch (e) {
    if (DEV_LOG) console.error('openTrimModal error:', e);
    alert('画像の準備に失敗しました');
    closeTrimModal();
  }
};

const saveTrimmedImage = async () => {
  if (!currentTrimInv.value || isSavingOgp.value) return;

  isSavingOgp.value = true;
  try {
    const canvas = trimCanvas.value;
    if (!canvas) throw new Error('canvas not ready');

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
    );
    if (!blob) throw new Error('blob not created');

    const result = await uploadInvestigatorOgpImage(currentTrimInv.value.id, blob);
    if ((result as any)?.ok === false) {
      throw new Error((result as any)?.error || 'アップロード失敗');
    }

    closeTrimModal();
  } catch (e: any) {
    if (DEV_LOG) console.error('saveTrimmedImage error:', e);
    alert('OGP画像の保存に失敗しました: ' + (e?.message || e));
  } finally {
    isSavingOgp.value = false;
  }
};

const closeTrimModal = () => {
  showTrimModal.value = false;
  currentTrimInv.value = null;
  trimImage.value = null;

  const canvas = trimCanvas.value;
  if (canvas) {
    canvas.removeEventListener('mousedown', onTrimMouseDown as any);
    canvas.removeEventListener('mousemove', onTrimMouseMove as any);
    canvas.removeEventListener('mouseup', onTrimMouseUp as any);
    canvas.removeEventListener('mouseleave', onTrimMouseUp as any);
    canvas.removeEventListener('wheel', onTrimWheel as any);
  }
};
</script>

<style scoped>
.container {
  padding: 16px 10%;
}
.title {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 600;
}

/* OGPトリミングモーダル */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  max-width: 900px;
  width: 95%;
}

.trim-container {
  width: 100%;
  overflow: hidden;
  margin: 12px 0;
}

.trim-canvas {
  width: 100%;
  max-width: 800px;
  display: block;
  margin: 0 auto;
  border: 1px solid #ddd;
}

.trim-controls {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.trim-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.controls {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 8px 0 16px;
  flex-wrap: wrap;
}
.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.control-label {
  font-size: 12px;
  color: #666;
}
.control-select {
  padding: 4px 8px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
}
.control-input {
  width: 140px;
  padding: 4px 8px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
}

.main-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border: 1px solid #ddd;
}
.main-table th,
.main-table td {
  border: 1px solid #e0e0e0;
}
.th-id {
  width: 60px;
  padding: 8px;
  text-align: center;
}
.th-name {
  width: 200px;
  padding: 8px;
}
.th-data {
  padding: 8px;
}
.th-action {
  width: 150px;
  padding: 8px;
  text-align: center;
}

.cell {
  padding: 8px;
  vertical-align: top;
}
.cell-id {
  text-align: center;
}
.cell-name {
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
}
.name-text {
  margin-top: 6px;
}
.input-small {
  width: 180px;
  padding: 6px;
  box-sizing: border-box;
}
.created-at-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.thumb-box {
  width: 160px;
  height: 160px;
  aspect-ratio: 1 / 1;
  background: #e5e5e5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}
.thumb-placeholder {
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 12px;
  text-align: center;
  white-space: pre-line;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cell-data {
  min-width: 0;
  overflow: hidden;
}
.cell-action {
  text-align: center;
}
.cell-compact {
  padding: 0;
}

.data-scroll {
  max-width: 100%;
  overflow: auto;
}

.section-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e6e6e6;
  margin-bottom: 12px;
}
.section-details {
  margin-bottom: 8px;
}
.section-summary {
  cursor: pointer;
  font-weight: 600;
  padding: 8px;
  background: #f7f7f7;
  border-bottom: 1px solid #eee;
}

.text-wrap {
  word-break: break-word;
}
.detail-box {
  word-break: break-word;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
}

.table-scroll {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}
.inner-table {
  border-collapse: collapse;
  width: max-content;
  min-width: 100%;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #e6e6e6;
}
.inner-table--spaced {
  margin-top: 4px;
}
.table-head {
  padding: 6px 8px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}
.table-cell {
  padding: 6px 8px;
}
.muted {
  font-size: 12px;
  color: #666;
  display: inline-block;
  margin-top: 4px;
}

.action-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
}
</style>
