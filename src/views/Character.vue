<template>
  <div class="container">
    <h1 class="title">探索者一覧</h1>
    <router-view></router-view>
  </div>
</template>

<script setup>
</script>

<style scoped>
.container { padding:16px 10%; text-align:left; }
.title { margin-bottom:12px; font-size:24px; font-weight:600; }

@media (max-width: 768px) {
  .container { padding:16px 4%; }
}
</style>
