<template>
  <div class="list-container">
    <div class="controls">
      <div class="control-item">
        <label class="control-label">並び替え</label>
        <BaseSelect v-model="sortKey" class="control-select">
          <option value="created">作成順</option>
          <option value="height">身長順</option>
          <option value="age">年齢順</option>
          <option value="app">APP順</option>
        </BaseSelect>
        <BaseSelect v-model="sortOrder" class="control-select">
          <option value="desc">降順</option>
          <option value="asc">昇順</option>
        </BaseSelect>
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
    <ul class="grid">
      <li v-for="item in displayedList" :key="item.id" class="card">
        <router-link :to="`/character/view/${item.id}`" class="card-link">
          <div class="thumb-box" :class="{ 'thumb-box--has-image': !isThumbMissing(item.id) }">
            <img
              v-if="!isThumbMissing(item.id)"
              :src="getThumbUrl(item.id)"
              class="thumb-img"
              @error="onThumbError(item.id)"
            />
            <span v-else class="thumb-placeholder">NO
IMAGE</span>
          </div>
          <div class="name">{{ item.name }}</div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { investigatorList } from '@/util/api.js'
import BaseSelect from '@/src/components/ui/BaseSelect.vue'

const list = ref([])
const brokenThumbs = ref({})
const thumbVersion = ref(0)
const sortKey = ref('created')
const sortOrder = ref('desc')
const sexFilter = ref('all')

const assetsBase = import.meta.env.BASE_URL || '/'
const getThumbUrl = (id) => `${assetsBase}assets/img/investigator/thumb/${id}.png?v=${thumbVersion.value}`
const isThumbMissing = (id) => !!brokenThumbs.value?.[id]
const onThumbError = (id) => {
  brokenThumbs.value = { ...brokenThumbs.value, [id]: true }
}

const normalizeStatus = (status) => {
  if (!status) return {}
  if (typeof status === 'string') {
    try {
      return JSON.parse(status)
    } catch (e) {
      return {}
    }
  }
  return status
}

const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return null
  const n = Number(val)
  return Number.isNaN(n) ? null : n
}

const getAppValue = (item) => {
  const app = item?.status?.app
  if (app && typeof app === 'object') return toNumber(app.default)
  return toNumber(app)
}

const isMale = (sex) => sex === '男' || sex === '男性' || sex === 'male' || sex === 'Male'
const isFemale = (sex) => sex === '女' || sex === '女性' || sex === 'female' || sex === 'Female'

const filteredList = computed(() => {
  if (sexFilter.value === 'all') return list.value
  if (sexFilter.value === 'male') return list.value.filter((item) => isMale(item.sex))
  if (sexFilter.value === 'female') return list.value.filter((item) => isFemale(item.sex))
  return list.value.filter((item) => !isMale(item.sex) && !isFemale(item.sex))
})

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

const getCreatedValue = (item) => {
  const createdAt = item?.created_at ?? item?.created_ymd
  const dateVal = toDateNumber(createdAt)
  if (dateVal !== null) return dateVal
  return toNumber(item.id)
}

const getSortValue = (item) => {
  if (sortKey.value === 'created') return getCreatedValue(item)
  if (sortKey.value === 'height') return toNumber(item.height)
  if (sortKey.value === 'age') return toNumber(item.age)
  if (sortKey.value === 'app') return getAppValue(item)
  return null
}

const displayedList = computed(() => {
  const items = [...filteredList.value]
  const order = sortOrder.value === 'asc' ? 1 : -1
  return items.sort((a, b) => {
    const av = getSortValue(a)
    const bv = getSortValue(b)
    if (av === null && bv === null) return 0
    if (av === null) return 1
    if (bv === null) return -1
    if (av === bv) return 0
    return av > bv ? order : -order
  })
})

onMounted(async () => {
  try {
    const data = await investigatorList()
    list.value = Array.isArray(data)
      ? data.map((item) => ({ ...item, status: normalizeStatus(item.status) }))
      : []
    brokenThumbs.value = {}
    thumbVersion.value += 1
  } catch (e) {
    console.error('investigatorList error:', e)
    list.value = []
  }
})
</script>

<style scoped>
.list-container { 
    text-align:left;
    display: flex;
    flex-direction:column;
    justify-content: center;
    align-items: center;
 }
.controls {
  width:80%;
  display:flex;
  gap:12px;
  align-items:center;
  margin:8px auto 16px;
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
.grid {
  list-style:none;
  padding:0;
  margin:0;
  display:grid;
  grid-template-columns:repeat(5, minmax(0, 1fr));
  gap:16px;
  width: 80%;
  grid-auto-rows:auto;
  max-height:none;
  padding-bottom:6px;
  overflow:hidden;
}
.card {
  border:1px solid #e6e6e6;
  border-radius:6px;
  overflow:hidden;
  background:#fff;
  height:auto;
  width:100%;
  justify-self:center;
}
.card-link {
  display:flex;
  flex-direction:column;
  text-decoration:none;
  color:inherit;
  padding:8px;
  height:auto;
  box-sizing:border-box;
  gap:8px;
}
.thumb-box {
  width:100%;
  height:auto;
  aspect-ratio:1 / 2;
  background:#e5e5e5;
  border-radius:4px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}
.thumb-box--has-image { background:#fff; }
.thumb-img { width:100%; height:100%; object-fit:contain; object-position:center; display:block; }
.thumb-placeholder {
  width:100%;
  height:100%;
  color:#666;
  font-size:24px;
  text-align:center;
  white-space:pre-line;
  line-height:1.2;
  display:flex;
  align-items:center;
  justify-content:center;
}
.name { font-weight:600; text-align:center; flex:0 0 auto; height:32px; line-height:32px; }

@media (max-width: 768px) {
  .controls {
    width:100%;
  }
  .grid {
    width:100%;
    grid-template-columns:repeat(3, 30%);
    justify-content:space-between;
    grid-auto-rows:auto;
    max-height:none;
  }
  .card {
    width:100%;
    padding-bottom: 16px;
    aspect-ratio:1 / 2;
  }
  .name{
    font-size: 16px;
    line-height: 16px;
  }
}
</style>
