<template>
  <div class="container">
    <h2 class="title">アップロード</h2>

    <form class="panel" @submit.prevent="submit">
      <div class="form-row">
        <label>ファイル <span class="required">*</span></label
        ><br />
        <input ref="fileInput" type="file" @change="onFileChange" required class="input-full" />
        <div v-if="errors.file" class="error-text">
          {{ errors.file }}
        </div>
      </div>

      <div class="form-row">
        <label>タイトル <span class="required">*</span></label
        ><br />
        <BaseInput v-model="title" placeholder="タイトル" class="input-full" block />
        <div v-if="errors.title" class="error-text">
          {{ errors.title }}
        </div>
      </div>

      <div class="form-row">
        <label>キャプション <span class="required">*</span></label
        ><br />
        <BaseTextarea v-model="caption" placeholder="キャプション" class="textarea-large" block />
        <div v-if="errors.caption" class="error-text">
          {{ errors.caption }}
        </div>
      </div>

      <div class="form-row">
        <label>登録日 <span class="required">*</span></label
        ><br />
        <BaseInput v-model="created_ymd" placeholder="YYYYMMDD" class="input-small" />
        <div v-if="errors.created_ymd" class="error-text">
          {{ errors.created_ymd }}
        </div>
      </div>

      <div class="form-row">
        <label>タグ</label><br />
        <BaseInput v-model="tags" placeholder="tag1,tag2" class="input-full" block />
      </div>

      <div class="form-row-inline">
        <label class="checkbox">
          <input type="checkbox" v-model="hide_flg" />
          ネタバレ有り
        </label>
      </div>

      <div class="form-row">
        <label>秘匿質問</label><br />
        <BaseTextarea v-model="hide_Q" placeholder="質問文" class="textarea-small" block />
      </div>

      <div class="form-row">
        <label>秘匿パスワード</label><br />
        <BaseInput v-model="hide_A" placeholder="パスワード" class="input-full" block />
      </div>

      <div v-if="errors.api" class="error-text bold">
        {{ errors.api }}
      </div>

      <div class="button-row">
        <BaseButton type="submit" variant="primary">送信</BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAdminIllustUpload } from '@/composable/useAdminIllustUpload.js';
import BaseButton from '@/src/components/ui/BaseButton.vue';
import BaseInput from '@/src/components/ui/BaseInput.vue';
import BaseTextarea from '@/src/components/ui/BaseTextarea.vue';

const fileInput = ref(null);
const {
  file,
  title,
  caption,
  created_ymd,
  tags,
  hide_flg,
  hide_Q,
  hide_A,
  errors,
  submit: composableSubmit,
  reset,
} = useAdminIllustUpload();

const onFileChange = (e) => {
  file.value = e.target.files?.[0];
  if (file.value) errors.file = null;
};

const submit = async () => {
  await composableSubmit();
  if (fileInput.value) fileInput.value.value = '';
};
</script>

<style scoped>
.container {
  padding: 16px 10%;
  text-align: left;
}
.title {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 600;
}
.panel {
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 4px;
}
.form-row {
  margin-bottom: 12px;
}
.form-row-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.input-full {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}
.input-small {
  width: 140px;
  padding: 6px;
  box-sizing: border-box;
}
.textarea-large {
  width: 100%;
  height: 120px;
  padding: 6px;
  box-sizing: border-box;
}
.textarea-small {
  width: 100%;
  height: 80px;
  padding: 6px;
  box-sizing: border-box;
}
.required {
  color: #d00;
}
.error-text {
  color: #d00;
  font-size: 0.85em;
  margin-top: 4px;
}
.error-text.bold {
  font-weight: 600;
}
.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}
.button-row {
  margin-top: 8px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px 4%;
  }
  .input-small {
    width: 100%;
  }
}
</style>
