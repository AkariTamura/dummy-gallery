<template>
  <!-- Detail view -->
  <div class="detail-container">
    <router-link to="/character" class="back-link">一覧に戻る</router-link>

    <div v-if="item" class="detail">
      <div class="image-col">
        <img
          v-if="!isImageMissing"
          :src="getImageUrl(item.id)"
          class="detail-image"
          @error="isImageMissing = true"
        />
        <div v-else class="image-placeholder">NO IMAGE</div>
      </div>
      <div class="info-col">
        <div class="row">
          <span class="label">名前</span><span class="value">{{ displayName }}</span>
        </div>
        <div class="row">
          <span class="label">年齢</span><span class="value">{{ item.age }}</span>
        </div>
        <div class="row">
          <span class="label">性別</span><span class="value">{{ item.sex }}</span>
        </div>
        <div class="row">
          <span class="label">身長</span><span class="value">{{ formatHeight(item.height) }}</span>
        </div>
        <div class="row">
          <span class="label">APP</span><span class="value">{{ getStatusDefault('app') }}</span>
        </div>
        <div class="row">
          <span class="label">SIZ</span><span class="value">{{ getStatusDefault('siz') }}</span>
        </div>
        <div class="row">
          <span class="label">職業</span><span class="value">{{ item.job }}</span>
        </div>
        <div class="row">
          <span class="label">出身シナリオ</span
          ><span class="value">{{ item.pc_from || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { investigatorDetail, INVESTIGATOR_BASE } from '@/util/api.js';

const route = useRoute();
const item = ref(null);
const isImageMissing = ref(false);

const getImageUrl = (id) =>
  `${INVESTIGATOR_BASE}?mode=investigator_image&id=${encodeURIComponent(id)}`;

const normalizeStatus = (status) => {
  if (!status) return {};
  if (typeof status === 'string') {
    try {
      return JSON.parse(status);
    } catch (e) {
      return {};
    }
  }
  return status;
};

const displayName = computed(() => {
  const fullname = String(item.value?.fullname || '').trim();
  const kana = String(item.value?.kana || '').trim();
  const base = fullname || String(item.value?.name || '').trim();
  if (!base) return '-';
  return kana
    ? `${base}
（${kana}）`
    : base;
});

const getStatusDefault = (key) => {
  const val = item.value?.status?.[key];
  if (val && typeof val === 'object') return val.default ?? 0;
  if (val === 0) return 0;
  if (val === null || val === undefined || val === '') return '-';
  return val;
};

const formatHeight = (height) => {
  if (height === null || height === undefined || height === '') return '-';
  const text = String(height).trim();
  if (!text) return '-';
  if (/cm$/i.test(text)) return text;
  return `${text}cm`;
};

onMounted(async () => {
  try {
    const data = await investigatorDetail(route.params.id);
    item.value = data?.error ? null : { ...data, status: normalizeStatus(data?.status) };
    isImageMissing.value = false;
  } catch (e) {
    console.error('investigatorDetail error:', e);
    item.value = null;
    isImageMissing.value = false;
  }
});
</script>

<style scoped>
.detail-container {
  text-align: left;
}
.back-link {
  display: inline-block;
  margin-bottom: 12px;
  color: #007bff;
  text-decoration: none;
}
.detail {
  display: flex;
  gap: 24px;
  align-items: stretch;
  height: calc(100vh - 120px);
  justify-content: end;
}
.image-col {
  flex: 0 0 40%;
}
.detail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 6px;
  border: 1px solid #eee;
}
.image-placeholder {
  width: 100%;
  height: 100%;
  background: #e5e5e5;
  border-radius: 6px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 24px;
  white-space: pre-line;
  line-height: 1.2;
}
.info-col {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.row {
  width: 100%;
  max-width: 360px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}
.label {
  display: block;
  font-weight: 600;
  color: #444;
  margin-bottom: 4px;
}
.value {
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .detail {
    flex-direction: column;
    height: auto;
    gap: 16px;
  }
  .image-col,
  .info-col {
    flex: 1 1 auto;
    width: 100%;
  }
  .info-col {
    align-items: stretch;
  }
  .row {
    max-width: none;
  }
}
</style>
