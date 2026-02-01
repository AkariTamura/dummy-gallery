<template>
  <!-- Detail view -->
  <div class="detail-container">

    <router-link to="/character" class="back-link">一覧に戻る</router-link>

    <h1 class="title">{{ item?.name }}</h1>
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
    <!-- SNS投稿ボタン群 -->
    <div class="sns-share-buttons" style="margin-top: 16px; display: flex; gap: 12px;">
      <BaseButton variant="secondary" @click="shareToTwitter">Twitterで投稿</BaseButton>
      <BaseButton variant="secondary" @click="shareToBluesky">Blueskyで投稿</BaseButton>
      <BaseButton variant="copy" @click="copyShareText">コピーして共有</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// クリップボードコピー用
const copyShareText = async () => {
  if (!item.value) return;
  const text = `${item.value?.name || ''}\n${window.location.href}`;
  try {
    await navigator.clipboard.writeText(text);
    alert('共有テキストをコピーしました');
  } catch (e) {
    alert('コピーに失敗しました');
  }
};
import BaseButton from '@/src/components/ui/BaseButton.vue';
// SNSシェア用関数群
function shareToTwitter() {
  if (!item.value) return;
  const text = encodeURIComponent(item.value?.name || '');
  const url = encodeURIComponent(window.location.href);
  const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  window.open(shareUrl, '_blank');
}

function shareToBluesky() {
  if (!item.value) return;
  const text = encodeURIComponent(item.value?.name || '');
  const url = encodeURIComponent(window.location.href);
  const shareUrl = `https://bsky.app/intent/post?text=${text}%20${url}`;
  window.open(shareUrl, '_blank');
}
const DEV_LOG = import.meta.env.DEV;
import { computed, onMounted, ref, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { investigatorDetail, INVESTIGATOR_BASE } from '@/util/api';
import { setMeta, restoreDefaults } from '@/util/meta';

const route = useRoute();
const routeId = route.params.id as string | string[] | undefined;
const investigatorId = Array.isArray(routeId) ? routeId[0] : routeId || '';
const item = ref(null);
const isImageMissing = ref(false);

const assetsBase = import.meta.env.BASE_URL || '/';
const getImageUrl = (id) =>
  `${INVESTIGATOR_BASE}?mode=investigator_image&id=${encodeURIComponent(id)}`;
const getThumbUrl = (id) => `${assetsBase}assets/img/investigator/thumb/${id}.png`;

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
  if (!item.value) return '読み込み中...';
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
  const data = await investigatorDetail(investigatorId);
    item.value = data?.error ? null : { ...data, status: normalizeStatus(data?.status) };
    isImageMissing.value = false;
  } catch (e) {
    if (DEV_LOG) console.error('investigatorDetail error:', e);
    item.value = null;
    isImageMissing.value = false;
  }
});

// OGP 画像: investigator 用の ogp ディレクトリ JPG を優先して使用
watch(
  item,
  (v) => {
  if (!v) return;
  const title = displayName.value || document.title;
  const description = v.detail || v.job || '';

  let image = '';
  if (investigatorId) {
    const base = (import.meta as any).env.BASE_URL || '/';
    const normBase = String(base).endsWith('/') ? String(base).slice(0, -1) : String(base);
    const ogpPath = `${normBase}/assets/img/investigator/ogp/${investigatorId}.jpg`;
    image = `${window.location.origin}${ogpPath}`;
  } else {
    // フォールバックとして画像エンドポイントを使用
    const full = getImageUrl(v.id);
    image = full.startsWith('http') ? full : `${window.location.origin}${full}`;
  }

  setMeta({ title, description, image, url: window.location.href, card: 'summary_large_image' });
  },
  { immediate: true }
);

onUnmounted(() => {
  restoreDefaults();
});
</script>

<style scoped>
.sns-share-buttons {
  justify-content: end;
}
.title {
  margin: 8px 0 12px;
  font-size: 24px;
  font-weight: 600;
}
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
