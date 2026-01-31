<template>
  <div>
    <div class="admin-nav">
      <router-link class="admin-nav-item" to="/admin/list">イラスト管理</router-link>
      <router-link class="admin-nav-item" to="/admin/upload">アップロード</router-link>
      <router-link class="admin-nav-item" to="/admin/character">探索者管理</router-link>
      <router-link class="admin-nav-item" to="/admin/entry">探索者登録</router-link>
      <button class="admin-nav-item admin-nav-logout" type="button" @click="doLogout">
        ログアウト
      </button>
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { logout } from '@/util/api.ts';
const router = useRouter();
const doLogout = async () => {
  await logout();
  router.push('/login');
};
</script>

<style scoped>
.admin-nav {
  display: flex;
  gap: 16px;
  padding: 16px 10%;
  text-align: left;
  flex-wrap: wrap;
}
.admin-nav-item {
  cursor: pointer;
  font-weight: 600;
  color: #333;
  text-decoration: none;
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
}
.admin-nav-item:hover {
  color: #28a745;
}
.admin-nav-item + .admin-nav-item {
  position: relative;
  padding-left: 16px;
}
.admin-nav-item + .admin-nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 16px;
  background: #ddd;
}

@media (max-width: 768px) {
  .admin-nav {
    padding: 12px 4%;
    gap: 12px;
  }
  .admin-nav-item + .admin-nav-item::before {
    height: 12px;
  }
}
</style>
