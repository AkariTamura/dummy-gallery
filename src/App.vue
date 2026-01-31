<template>
  <div class="app-root">
    <Navigation />
    <router-view />
    <div v-if="isLoading" class="loading-overlay" aria-live="polite" aria-busy="true">
      <div class="loading-box">
        <div class="spinner" aria-hidden="true"></div>
        <div class="loading-text">読み込み中…</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navigation from './views/Navigation.vue';

const route = useRoute();
const isLoading = ref(false);
let timerId = null;

const showLoading = () => {
  isLoading.value = true;
  if (timerId) clearTimeout(timerId);
  timerId = setTimeout(() => {
    isLoading.value = false;
    timerId = null;
  }, 500);
};

watch(
  () => route.fullPath,
  (newVal, oldVal) => {
    if (newVal !== oldVal && route.path === '/') showLoading();
  }
);

onMounted(() => {
  if (route.path === '/') showLoading();
});

onBeforeUnmount(() => {
  if (timerId) clearTimeout(timerId);
});
</script>

<style scoped>
.app-root {
  padding-top: 56px;
}
.loading-overlay {
  position: fixed;
  inset: 56px 0 0 0;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  backdrop-filter: blur(1px);
}
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e5e5;
  border-top-color: #26c5b8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text {
  font-size: 12px;
  color: #444;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
