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
          <option v-for="opt in statusSortOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
        </BaseSelect>
        <BaseSelect v-if="sortType === 'skill'" v-model="skillCategory" class="control-select">
          <option v-for="opt in skillCategoryOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
        </BaseSelect>
        <BaseSelect v-if="sortType === 'skill'" v-model="sortKey" class="control-select">
          <option v-for="opt in skillSortOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
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
          <td class="cell cell-id">{{inv.id}}</td>

          <!-- 名前 -->
          <td class="cell cell-name">
            <div class="thumb-box">
              <img
                v-if="!isThumbMissing(inv.id)"
                :src="getThumbUrl(inv.id)"
                class="thumb-img"
                @error="onThumbError(inv.id)"
              />
              <span v-else class="thumb-placeholder">NO
IMAGE</span>
            </div>
            <div class="name-text">{{inv.name}}</div>
          </td>

          <!-- データ -->
            <td class="cell cell-data">
              <div class="data-scroll">
            <!-- プロフィール -->
            <table class="section-table">
                <details class="section-details">
                    <summary class="section-summary">
                        プロフィール
                    </summary>
                    <tbody>
                        <tr><td class="cell">正式名</td><td class="cell">{{ inv.fullname || '-' }}</td></tr>
                        <tr><td class="cell">フリガナ</td><td class="cell">{{ inv.kana || '-' }}</td></tr>
                        <tr><td class="cell">年齢</td><td class="cell">{{inv.age}}</td></tr>
                        <tr><td class="cell">性別</td><td class="cell">{{inv.sex}}</td></tr>
                        <tr><td class="cell">身長</td><td class="cell">{{inv.height}}</td></tr>
                        <tr><td class="cell">職業</td><td class="cell">{{inv.job}}</td></tr>
                        <tr><td class="cell">出身シナリオ</td><td class="cell">{{ inv.pc_from || '-' }}</td></tr>
                        <tr>
                        <td class="cell">特徴表</td>
                        <td class="cell text-wrap">{{ parseFeature(inv.feature) }}</td>
                        </tr>
                        <tr>
                          <td class="cell">詳細</td>
                          <td class="cell">
                            <div class="detail-box">
                              {{inv.detail}}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td class="cell">URL</td>
                          <td class="cell text-wrap">
                            <a v-if="inv.url" :href="inv.url" target="_blank" rel="noopener noreferrer">{{ inv.url }}</a>
                            <span v-else>-</span>
                          </td>
                        </tr>
                        <tr>
                          <td class="cell">登録日</td>
                          <td class="cell">
                            <div class="created-at-row">
                              <BaseInput v-model="inv.created_at" class="input-small" placeholder="YYYYMMDD" />
                              <BaseButton variant="primary" size="sm" @click="doUpdateCreatedAt(inv)">保存</BaseButton>
                            </div>
                          </td>
                        </tr>
                    </tbody>
                </details>
            </table>

            <!-- ステータス -->
            <table class="section-table">
                <details class="section-details">
                    <summary class="section-summary">
                        ステータス
                    </summary>
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
                                  <div>{{ inv.status?.san?.default ?? ((inv.status?.ini_san?.default || 0) + (inv.status?.ini_san?.ex1 || 0) + (inv.status?.ini_san?.ex2 || 0)) }}</div>
                                  </template>
                                  <template v-else>
                                  {{ (inv.status[item.key]?.default ?? 0) + (inv.status[item.key]?.ex1 ?? 0) + (inv.status[item.key]?.ex2 ?? 0) }}
                                  <br>
                                  <span class="muted" v-if="inv.status[item.key] && (item.key !== 'san')">
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
                <summary class="section-summary">
                        技能値
                    </summary>

                    <tbody>
                        <!-- 技能カテゴリごと -->
                        <tr
                        v-for="(categoryKey, categoryLabel) in skillList"
                        :key="categoryKey"
                        >
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
                                      <th v-if="item && item.default !== undefined" class="table-cell">
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
                  <BaseButton variant="secondary" title="ステータスと技能値のみ更新されます" @click="doUpdateFromStorage(inv)">保管所から更新</BaseButton>
                  <BaseButton variant="primary" title="登録画面を開きます" @click="doEditInvestigator(inv.id)">手動で修正</BaseButton>
                  <BaseButton variant="danger" title="一度削除すると戻せません" @click="doDeleteInvestigator(inv.id)">DBから削除</BaseButton>
                  <BaseButton variant="copy" title="ココフォリア用の駒を生成します" @click="copyToken(inv)">駒をコピー</BaseButton>
                </div>
           </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminInvestigators } from '@/composable/useAdminInvestigators.js'
import { useAdminInvestigatorEntry } from '@/composable/useAdminInvestigatorEntry.js'
import investigatorInfo from '@/assets/json/investigatorInfo.json'
import BaseButton from '@/src/components/ui/BaseButton.vue'
import BaseInput from '@/src/components/ui/BaseInput.vue'
import BaseSelect from '@/src/components/ui/BaseSelect.vue'

const { list, refresh, remove, updateCreatedAt } = useAdminInvestigators()
const selected = ref(null)
const router = useRouter()
const brokenThumbs = ref({})
const thumbVersion = ref(0)
const { setEditingId, fetchFromUrl, submit, formData, errors } = useAdminInvestigatorEntry()

const sortType = ref('created')
const sortOrder = ref('desc')
const sortKey = ref('str')
const skillCategory = ref('combat')
const minFilter = ref(null)
const sexFilter = ref('all')

// JSONから取得
const statusList = investigatorInfo.statusList
const skillList = investigatorInfo.skillList

// statusList に '現在SAN'(san) を ini_san の前に挿入した配列を作る
const statusDisplay = computed(() => {
  const arr = []
  for (const [label, key] of Object.entries(investigatorInfo.statusList)) {
    if (key === 'ini_san') {
      arr.push({ label: '現在SAN', key: 'san' })
    }
    arr.push({ label, key })
  }
  return arr
})

const statusSortOptions = computed(() => statusDisplay.value.map(item => ({ key: item.key, label: item.label })))

const categoryLabelMap = computed(() => {
  const map = {}
  for (const [label, key] of Object.entries(skillList)) {
    map[key] = label
  }
  return map
})

const skillCategoryOptions = computed(() => {
  const result = []
  for (const [label, key] of Object.entries(skillList)) {
    result.push({ key, label })
  }
  return result
})

const skillSortOptions = computed(() => {
  const result = []
  const base = investigatorInfo.skillDefaultList || {}
  const items = base?.[skillCategory.value] || {}
  for (const [skillKey, val] of Object.entries(items || {})) {
    if (!Array.isArray(val) || val.length < 2) continue
    const label = `${val[0]}`
    result.push({ key: skillKey, label })
  }
  return result
})

const defaultSkillKeysMap = computed(() => {
  const map = {}
  const base = investigatorInfo.skillDefaultList || {}
  for (const [categoryKey, items] of Object.entries(base)) {
    map[categoryKey] = Object.keys(items || {}).filter((k) => Array.isArray(items[k]) && items[k].length >= 2)
  }
  return map
})

const skillLabelMap = computed(() => {
  const map = {}
  const base = investigatorInfo.skillDefaultList || {}
  for (const [categoryKey, items] of Object.entries(base)) {
    map[categoryKey] = {}
    for (const [skillKey, val] of Object.entries(items || {})) {
      if (!Array.isArray(val) || val.length < 2) continue
      map[categoryKey][skillKey] = val[0]
    }
  }
  return map
})

watch(sortType, (type) => {
  if (type === 'status') {
    const first = statusSortOptions.value?.[0]?.key
    if (first) sortKey.value = first
  }
  if (type === 'skill') {
    const firstCategory = skillCategoryOptions.value?.[0]?.key
    if (firstCategory) skillCategory.value = firstCategory
    const firstSkill = skillSortOptions.value?.[0]?.key
    if (firstSkill) sortKey.value = firstSkill
  }
}, { immediate: true })

watch(skillCategory, () => {
  const firstSkill = skillSortOptions.value?.[0]?.key
  if (firstSkill) sortKey.value = firstSkill
}, { immediate: true })

const showMinFilter = computed(() => sortType.value === 'status' || sortType.value === 'skill')

const isMale = (sex) => sex === '男' || sex === '男性' || sex === 'male' || sex === 'Male'
const isFemale = (sex) => sex === '女' || sex === '女性' || sex === 'female' || sex === 'Female'

const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return null
  const n = Number(val)
  return Number.isNaN(n) ? null : n
}

const toDateNumber = (val) => {
  if (!val) return null
  if (typeof val === 'string' && /^\d{8}$/.test(val)) {
    const y = Number(val.slice(0, 4))
    const m = Number(val.slice(4, 6)) - 1
    const d = Number(val.slice(6, 8))
    const date = new Date(y, m, d)
    const t = date.getTime()
    return Number.isNaN(t) ? null : t
  }
  const t = Date.parse(val)
  return Number.isNaN(t) ? null : t
}

const getCreatedValue = (inv) => {
  const dateVal = toDateNumber(inv?.created_at)
  if (dateVal !== null) return dateVal
  return toNumber(inv?.id)
}

const getStatusValue = (inv, key) => {
  if (!key) return null
  if (key === 'san') {
    const s = inv?.status || {}
    const ini = s?.ini_san || {}
    const base = toNumber(ini?.default ?? ini?.value) || 0
    const ex1 = toNumber(ini?.ex1) || 0
    const ex2 = toNumber(ini?.ex2) || 0
    return base + ex1 + ex2
  }
  return toNumber(inv?.status?.[key]?.default ?? inv?.status?.[key]?.value)
}

const getSkillItem = (inv, categoryKey, skillKey) => {
  const category = inv?.skill?.[categoryKey]
  if (!category || !skillKey) return null
  if (Array.isArray(category)) {
    const keys = defaultSkillKeysMap.value?.[categoryKey] || []
    const idx = keys.indexOf(skillKey)
    if (idx >= 0) return category[idx]
    const label = skillLabelMap.value?.[categoryKey]?.[skillKey]
    if (label) {
      return category.find((item) => item?.label === label || item?.name === label) || null
    }
    return null
  }
  if (typeof category === 'object') {
    if (category?.[skillKey] !== undefined) return category?.[skillKey]
    const label = skillLabelMap.value?.[categoryKey]?.[skillKey]
    if (label) {
      const items = Object.values(category)
      return items.find((item) => item?.label === label || item?.name === label) || null
    }
  }
  return null
}

const getSkillValue = (inv, categoryKey, skillKey) => {
  if (!categoryKey || !skillKey) return null
  const item = getSkillItem(inv, categoryKey, skillKey)
  if (item && typeof item === 'object') {
    const base = toNumber(item.default ?? item.value) || 0
    const ex1 = toNumber(item.ex1) || 0
    const ex2 = toNumber(item.ex2) || 0
    const ex3 = toNumber(item.ex3) || 0
    const ex4 = toNumber(item.ex4) || 0
    return base + ex1 + ex2 + ex3 + ex4
  }
  return toNumber(item)
}

const getSortValue = (inv) => {
  if (sortType.value === 'created') return getCreatedValue(inv)
  if (sortType.value === 'age') return toNumber(inv?.age)
  if (sortType.value === 'height') return toNumber(inv?.height)
  if (sortType.value === 'status') return getStatusValue(inv, sortKey.value)
  if (sortType.value === 'skill') return getSkillValue(inv, skillCategory.value, sortKey.value)
  return null
}

const displayedList = computed(() => {
  const items = [...(list.value || [])]
  const order = sortOrder.value === 'asc' ? 1 : -1
  const minVal = toNumber(minFilter.value)
  const minFiltered = minVal === null || !showMinFilter.value
    ? items
    : items.filter((inv) => {
        const v = getSortValue(inv)
        return v !== null && v >= minVal
      })
  const sexFiltered = sexFilter.value === 'all'
    ? minFiltered
    : minFiltered.filter((inv) => {
        if (sexFilter.value === 'male') return isMale(inv.sex)
        if (sexFilter.value === 'female') return isFemale(inv.sex)
        return !isMale(inv.sex) && !isFemale(inv.sex)
      })
  return sexFiltered.sort((a, b) => {
    const av = getSortValue(a)
    const bv = getSortValue(b)
    if (av === null && bv === null) return 0
    if (av === null) return 1
    if (bv === null) return -1
    if (av === bv) return 0
    return av > bv ? order : -order
  })
})

const assetsBase = import.meta.env.BASE_URL || '/'
const getThumbUrl = (id) => `${assetsBase}assets/img/investigator/thumb/${id}.png?v=${thumbVersion.value}`
const isThumbMissing = (id) => !!brokenThumbs.value?.[id]
const onThumbError = (id) => {
  brokenThumbs.value = { ...brokenThumbs.value, [id]: true }
}

const parseFeature = (text) => {
  try {
    const arr = JSON.parse(text)
    return Array.isArray(arr) ? arr.join(',\n') : text
  } catch {
    return text
  }
}

const getSkillTotal = (item) => {
  const toNum = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v))
  return (
    toNum(item?.default) +
    toNum(item?.ex1) +
    toNum(item?.ex2) +
    toNum(item?.ex3) +
    toNum(item?.ex4)
  )
}

const getStatusCurrent = (inv, key) => {
  if (!key) return 0
  if (key === 'san') return getStatusValue(inv, 'san') || 0
  const s = inv?.status?.[key] || {}
  const base = toNumber(s?.default ?? s?.value) || 0
  const ex1 = toNumber(s?.ex1) || 0
  const ex2 = toNumber(s?.ex2) || 0
  return base + ex1 + ex2
}

const getStatusBase = (inv, key) => {
  const s = inv?.status?.[key] || {}
  return toNumber(s?.default ?? s?.value) || 0
}

const getDamageBonus = (inv) => {
  const str = getStatusBase(inv, 'str') || 0
  const siz = getStatusBase(inv, 'siz') || 0
  const total = str + siz

  if (total >= 2 && total <= 12) return '-1d6'
  if (total >= 13 && total <= 16) return '-1d4'
  if (total >= 17 && total <= 24) return '0'
  if (total >= 25 && total <= 32) return '+1d4'
  if (total >= 33 && total <= 40) return '+1d6'
  if (total >= 41 && total <= 46) return '+2d6'
  if (total >= 57 && total <= 72) return '+3d6'
  if (total >= 73 && total <= 88) return '+4d6'

  return '0'
}

const buildSkillCommands = (inv) => {
  const commands = []
  const defaultList = investigatorInfo.skillDefaultList || {}

  for (const [categoryKey, items] of Object.entries(defaultList)) {
    // デフォルト技能
    for (const [skillKey, def] of Object.entries(items || {})) {
      if (!Array.isArray(def) || def.length < 2) continue
      const item = getSkillItem(inv, categoryKey, skillKey)
      const label = (item?.label ?? def?.[0] ?? '').trim()
      const total = item ? getSkillTotal(item) : null
      if (total !== null && total !== undefined) {
        commands.push(`CCB<=${total} ${label || '（）'}`)
      }
    }

    // 追加技能（配列）
    const category = inv?.skill?.[categoryKey]
    if (category && typeof category === 'object' && !Array.isArray(category)) {
      for (const [key, value] of Object.entries(category)) {
        if (!Array.isArray(value)) continue
        value.forEach((ex) => {
          const label = String(ex?.name ?? '').trim()
          const total = getSkillTotal(ex)
          commands.push(`CCB<=${total} ${label || '（）'}`)
        })
      }
    } else if (Array.isArray(category)) {
      category.forEach((ex) => {
        const label = String(ex?.name ?? ex?.label ?? '').trim()
        const total = getSkillTotal(ex)
        commands.push(`CCB<=${total} ${label || '（）'}`)
      })
    }
  }

  return commands
}

const buildCopyData = (inv) => {
  const hp = getStatusCurrent(inv, 'hp')
  const mp = getStatusCurrent(inv, 'mp')
  const san = getStatusCurrent(inv, 'san')
  const str = getStatusCurrent(inv, 'str')
  const con = getStatusCurrent(inv, 'con')
  const pow = getStatusCurrent(inv, 'pow')
  const dex = getStatusCurrent(inv, 'dex')
  const app = getStatusCurrent(inv, 'app')
  const siz = getStatusCurrent(inv, 'siz')
  const intVal = getStatusCurrent(inv, 'int')
  const edu = getStatusCurrent(inv, 'edu')
  const luck = getStatusCurrent(inv, 'luck')
  const idea = getStatusCurrent(inv, 'idea')
  const know = getStatusCurrent(inv, 'know')
  const db = getDamageBonus(inv)

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
    ...buildSkillCommands(inv)
  ]

  return {
    kind: 'character',
    data: {
      name: inv?.name ?? '',
      initiative: dex,
      externalUrl: inv?.url ?? '',
      status: [
        { label: 'HP', value: hp, max: hp },
        { label: 'MP', value: mp, max: mp },
        { label: 'SAN', value: san, max: san }
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
        { label: 'DB', value: String(db) }
      ],
      commands: commands.join('\n'),
      memo: ''
    }
  }
}

const copyToken = async (inv) => {
  try {
    const payload = JSON.stringify(buildCopyData(inv))
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload)
      alert('コピーしました')
      return
    }
    const el = document.createElement('textarea')
    el.value = payload
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    alert('コピーしました')
  } catch (e) {
    console.error('copy token error:', e)
    alert('コピーに失敗しました')
  }
}

const parseJSON = (text) => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

const doDeleteInvestigator = async (id) => {
  if (!id) return
  try {
    const result = await remove(id)
    if (result?.ok) {
      await refresh()
      return
    }
    alert(result?.error || '削除に失敗しました')
  } catch (e) {
    console.error('delete investigator error:', e)
    alert('削除に失敗しました')
  }
}

const doEditInvestigator = (id) => {
  if (!id) return
  router.push({ path: `/admin/entry/${id}` })
}

const doUpdateFromStorage = async (inv) => {
  if (!inv?.id) return
  if (!confirm('キャラクター保管所のデータから上書きしますか？')) return
  try {
    await setEditingId(inv.id)
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
      url: formData.value.url
    }
    const url = String(formData.value.url || '').trim()
    if (!url) {
      alert('URLがありません')
      return
    }
    await fetchFromUrl()
    if (errors.value?.api) {
      alert(errors.value.api)
      return
    }
    formData.value.name = preserved.name
    formData.value.fullname = preserved.fullname
    formData.value.kana = preserved.kana
    formData.value.age = preserved.age
    formData.value.sex = preserved.sex
    formData.value.height = preserved.height
    formData.value.job = preserved.job
    formData.value.pc_from = preserved.pc_from
    formData.value.feature = preserved.feature
    formData.value.detail = preserved.detail
    formData.value.url = preserved.url
    const ok = await submit()
    if (ok) {
      await refresh()
      brokenThumbs.value = {}
      thumbVersion.value += 1
      return
    }
    alert(errors.value?.api || '更新に失敗しました')
  } catch (e) {
    console.error('update from storage error:', e)
    alert('更新に失敗しました')
  }
}

const doUpdateCreatedAt = async (inv) => {
  if (!inv?.id) return
  try {
    const result = await updateCreatedAt(inv.id, inv.created_at ?? '')
    if (result?.ok) {
      await refresh()
      brokenThumbs.value = {}
      thumbVersion.value += 1
      return
    }
    alert(result?.error || '登録日の更新に失敗しました')
  } catch (e) {
    console.error('update created_at error:', e)
    alert('登録日の更新に失敗しました')
  }
}

</script>

<style scoped>
.container { padding:16px 10%; }
.title { margin-bottom:12px; font-size:24px; font-weight:600; }

.controls {
  width:100%;
  display:flex;
  gap:12px;
  align-items:center;
  margin:8px 0 16px;
  flex-wrap:wrap;
}
.control-item { display:flex; align-items:center; gap:8px; }
.control-label { font-size:12px; color:#666; }
.control-select {
  padding:4px 8px;
  border:1px solid #e6e6e6;
  border-radius:6px;
  background:#fff;
  font-size:12px;
}
.control-input {
  width:140px;
  padding:4px 8px;
  border:1px solid #e6e6e6;
  border-radius:6px;
  background:#fff;
  font-size:12px;
}

.main-table {
  width:100%;
  border-collapse:collapse;
  table-layout:fixed;
  border:1px solid #ddd;
}
.main-table th,
.main-table td { border:1px solid #e0e0e0; }
.th-id { width:60px; padding:8px; text-align:center; }
.th-name { width:200px; padding:8px; }
.th-data { padding:8px; }
.th-action { width:150px; padding:8px; text-align:center; }

.cell { padding:8px; vertical-align:top; }
.cell-id { text-align:center; }
.cell-name { font-weight:600; display:flex; flex-direction:column; align-items:flex-start; height:100%; }
.name-text { margin-top:6px; }
.input-small { width:180px; padding:6px; box-sizing:border-box; }
.created-at-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.thumb-box {
  width:160px;
  height:160px;
  aspect-ratio:1 / 1;
  background:#e5e5e5;
  border-radius:4px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}
.thumb-img { width:100%; height:100%; object-fit:cover; object-position:top; display:block; }
.thumb-placeholder {
  width:100%;
  height:100%;
  color:#666;
  font-size:12px;
  text-align:center;
  white-space:pre-line;
  line-height:1.2;
  display:flex;
  align-items:center;
  justify-content:center;
}
.cell-data { min-width:0; overflow:hidden; }
.cell-action { text-align:center; }
.cell-compact { padding:0; }

.data-scroll { max-width:100%; overflow:auto; }

.section-table {
  width:100%;
  border-collapse:collapse;
  border:1px solid #e6e6e6;
  margin-bottom:12px;
}
.section-details { margin-bottom:8px; }
.section-summary {
  cursor:pointer;
  font-weight:600;
  padding:8px;
  background:#f7f7f7;
  border-bottom:1px solid #eee;
}

.text-wrap { word-break:break-word; }
.detail-box {
  word-break:break-word;
  white-space:pre-wrap;
  max-height:300px;
  overflow-y:auto;
  padding:4px 0;
}

.table-scroll { display:block; width:100%; max-width:100%; overflow-x:auto; }
.inner-table {
  border-collapse:collapse;
  width:max-content;
  min-width:100%;
  text-align:center;
  white-space:nowrap;
  border:1px solid #e6e6e6;
}
.inner-table--spaced { margin-top:4px; }
.table-head { padding:6px 8px; background:#fafafa; border-bottom:1px solid #eee; }
.table-cell { padding:6px 8px; }
.muted { font-size:12px; color:#666; display:inline-block; margin-top:4px; }

.action-stack { display:flex; flex-direction:column; gap:8px; align-items:stretch; }
</style>
