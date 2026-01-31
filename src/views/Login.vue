<template>
  <div class="container">
    <h2 class="title">ログインページ</h2>

    <p>パスワードは「pass」です。</p>
    <form class="form" @submit.prevent="doLogin">
      <BaseInput type="password" v-model="password" placeholder="Password" block />
      <BaseButton type="submit" variant="primary" style="width: 60px">送信</BaseButton>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/util/api.js';
import BaseButton from '@/src/components/ui/BaseButton.vue';
import BaseInput from '@/src/components/ui/BaseInput.vue';

const router = useRouter();

const password = ref('');
const error = ref('');

const doLogin = async () => {
  error.value = '';

  const res = await login(password.value);

  if (res.ok) {
    router.push('/admin');
  } else {
    error.value = 'ログイン失敗';
  }
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
.form {
  display: flex;
  flex-direction: row;
  gap: 8px;
  max-width: 360px;
  align-items: center;
}
.error {
  color: #d00;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px 4%;
  }
  .form {
    flex-direction: column;
    align-items: stretch;
    max-width: 100%;
  }
}
</style>
