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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useIllustDetail } from '@/composable/useIllustDetail.ts';
import BaseButton from '@/src/components/ui/BaseButton.vue';
import BaseInput from '@/src/components/ui/BaseInput.vue';

const route = useRoute();
const id = route.params.id;

const { illust, correctAnswer, userAnswer, checkAnswer } = useIllustDetail(id);
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
