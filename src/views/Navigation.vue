<template>
  <header class="nav-header">
    <nav class="nav-inner">
      <router-link to="/">トップ</router-link>
      <router-link to="/profile">プロフィール</router-link>
      <router-link to="/character">探索者</router-link>
      <router-link to="/illust">イラスト</router-link>
      <router-link to="/admin">管理ページ</router-link>
    </nav>
  </header>
</template>

<style scoped>
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  z-index: 1000;
}
.nav-inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 10%;
  text-align: left;
}
.nav-inner a {
  text-decoration: none;
  color: #333;
  font-weight: 600;
}
.nav-inner a:hover {
  color: #28a745;
}
</style>
