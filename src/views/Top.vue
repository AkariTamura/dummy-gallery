<template>
  <div class="top-full">
    <img class="top-image" :src="topImage" alt="Top" />
    <div class="top-badge">デモサイト公開中</div>
  </div>
</template>

<script setup>
import topImage from '@/assets/img/top/topImage.PNG';
</script>

<style scoped>
.top-full {
  position: fixed;
  inset: 56px 0 0 0;
  overflow: hidden;
}
.top-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.6;
}
.top-badge {
  position: absolute;
  right: 24px;
  bottom: 24px;
  font-size: 8rem;
  font-weight: 700;
  color: #333;
  background: rgba(255, 255, 255, 0.75);
  padding: 12px 24px;
  border-radius: 12px;
  text-shadow: 0 5px 10px rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .top-badge {
    right: 12px;
    bottom: 12px;
    font-size: 2.4rem;
    padding: 8px 12px;
    border-radius: 8px;
  }
}
</style>
