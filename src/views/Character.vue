<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts"></script>

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

@media (max-width: 768px) {
  .container {
    padding: 16px 4%;
  }
}
</style>
