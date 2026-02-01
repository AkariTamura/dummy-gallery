<template>
  <!-- ===================== -->
  <!-- DETAIL -->
  <!-- ===================== -->
  <div class="container">
    <router-link class="back-link" to="/illust">一覧に戻る</router-link>

    <!-- ネタバレ制御 -->
    <div v-if="illust?.hide_flg && !correctAnswer" class="spoiler-panel">
      <p class="spoiler-question">{{ illust.hide_Q }}</p>
      <div class="spoiler-inputs">
        <BaseInput
          type="text"
          v-model="userAnswer"
          placeholder="答えを入力"
          class="small-input"
          block
          style="width: 300px; margin-right: 10px"
        />
        <BaseButton variant="primary" @click="checkAnswer" style="width: 60px">送信</BaseButton>
      </div>
    </div>

    <!-- 正解 or ネタバレなし -->
    <div v-else-if="illust" class="detail">
      <h1 class="title">{{ illust.title }}</h1>
      <img :src="illust.image" class="detail-image" />
      <p class="caption">{{ illust.caption }}</p>

      <p v-if="illust.tags?.length" class="tags">
        タグ：
        <router-link
          v-for="t in illust.tags"
          :key="t"
          class="tag"
          :to="{ path: '/illust', query: { tag: t } }"
        >
          {{ t }}
        </router-link>
      </p>
      <!-- SNS投稿ボタン群 -->
      <div class="sns-share-buttons" style="margin-top: 16px; display: flex; gap: 12px;">
        <BaseButton variant="secondary" @click="shareToTwitter">Twitterで投稿</BaseButton>
        <BaseButton variant="secondary" @click="shareToBluesky">Blueskyで投稿</BaseButton>
        <BaseButton variant="copy" @click="copyShareText">コピーして共有</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// クリップボードコピー用
async function copyShareText() {
  if (!illust.value) return;
  const text = `${illust.value.title}\n${window.location.href}`;
  try {
    await navigator.clipboard.writeText(text);
    alert('共有テキストをコピーしました');
  } catch (e) {
    alert('コピーに失敗しました');
  }
}
import { useRoute } from 'vue-router';
import { useIllustDetail } from '@/composable/useIllustDetail';
import { watch, onUnmounted } from 'vue';
import { setMeta, restoreDefaults } from '@/util/meta';
import BaseButton from '@/src/components/ui/BaseButton.vue';
import BaseInput from '@/src/components/ui/BaseInput.vue';

const route = useRoute();
const routeId = route.params.id as string | string[] | undefined;
const illustId = Array.isArray(routeId) ? routeId[0] : routeId || '';

const { illust, correctAnswer, userAnswer, checkAnswer } = useIllustDetail(illustId);

// watch illust and update OGP when loaded
watch(
  illust,
  (v) => {
    if (!v) return;
    const title = v.title || document.title;
    const description = v.caption || '';

    // OGP 用の画像は ogp ディレクトリの JPG を優先して使用
    let image = '';
    if (illustId) {
      const base = (import.meta as any).env.BASE_URL || '/';
      const normBase = String(base).endsWith('/') ? String(base).slice(0, -1) : String(base);
      const ogpPath = `${normBase}/assets/img/illust/ogp/${illustId}.jpg`;
      image = `${window.location.origin}${ogpPath}`;
    } else if (v.image) {
      // フォールバックとして従来の画像パスを使用
      image = v.image.startsWith('http') ? v.image : `${window.location.origin}${v.image}`;
    }

    const url = window.location.href;
    setMeta({ title, description, image, url, card: 'summary_large_image' });
  },
  { immediate: true }
);

onUnmounted(() => {
  restoreDefaults();
});

// SNSシェア用関数群
function shareToTwitter() {
  if (!illust.value) return;
  const text = encodeURIComponent(illust.value.title || '');
  const url = encodeURIComponent(window.location.href);
  const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  window.open(shareUrl, '_blank');
}

function shareToBluesky() {
  if (!illust.value) return;
  const text = encodeURIComponent(illust.value.title || '');
  const url = encodeURIComponent(window.location.href);
  // Bluesky公式のWeb+Actionスキーム
  const shareUrl = `https://bsky.app/intent/post?text=${text}%20${url}`;
  window.open(shareUrl, '_blank');
}

</script>

<style scoped>
.container {
  padding: 16px 10%;
  text-align: left;
}
.back-link {
  display: inline-block;
  margin-bottom: 12px;
  color: #007bff;
  text-decoration: none;
}
.title {
  margin: 8px 0 12px;
  font-size: 24px;
  font-weight: 600;
}
.detail-image {
  width: 100%;
  max-width: 720px;
  height: auto;
  display: block;
  margin: 8px 0 12px;
  border-radius: 6px;
  border: 1px solid #eee;
}
.caption {
  white-space: pre-wrap;
}
.tags {
  margin-top: 8px;
}
.tag {
  background: #f2f2f2;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  margin-left: 6px;
  display: inline-block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
.spoiler-panel {
  border: 1px solid #e6e6e6;
  padding: 12px;
  border-radius: 6px;
  background: #fafafa;
  width: 420px;
}
.spoiler-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}
.spoiler-question {
  margin-bottom: 8px;
}
.input-full {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
  margin-bottom: 8px;
}
.sns-share-buttons {
  justify-content: end;
}

@media (max-width: 768px) {
  .container {
    padding: 16px 4%;
  }
  .detail-image {
    max-width: 100%;
  }
  .spoiler-panel {
    width: 100%;
  }
  .spoiler-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  .spoiler-inputs .small-input {
    width: 100% !important;
    margin-right: 0 !important;
  }
}
</style>
