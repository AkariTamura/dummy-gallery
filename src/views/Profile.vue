<template>
  <section class="profile">
    <div class="profile-card">
      <div class="profile-image">
        <img :src="profileImage" alt="プロフィール画像" />
      </div>
      <div class="profile-body">
        <h2 class="profile-name">このサイトについて</h2>
        <p class="profile-text">
          このサイトはVue3+viteとPHPで構築されています。<br />
          イラスト掲載サイトとTRPG用のCS管理サイトを兼ねており、それぞれのデータはDBに保存されています。<br />
          外部リンクはダミーですのでご了承ください。<br />
          シナリオリンクは動作しますが、中身をダミーに置き換えているのでネタバレの心配なくご覧いただけます。
        </p>

        <h3 class="profile-subtitle">外部リンク</h3>
        <ul class="profile-links">
          <li><a href="" target="_blank" rel="noopener">Twitter</a></li>
          <li><a href="" target="_blank" rel="noopener">Pixiv</a></li>
          <li><a href="" target="_blank" rel="noopener">SKIMA</a></li>
          <li><a href="" target="_blank" rel="noopener">Booth</a></li>
        </ul>

        <h3 class="profile-subtitle">自作シナリオ</h3>
        <ul class="profile-links">
          <li>
            <a :href="baseUrl + 'scenario/dummy1/index.html'" target="_blank" rel="noopener"
              >ダミー１</a
            >
          </li>
          <li>
            <a :href="baseUrl + 'scenario/dummy2/index.html'" target="_blank" rel="noopener"
              >ダミー２</a
            >
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import profileImage from '@/assets/img/profile/profImage.PNG';

const baseUrl = import.meta.env.BASE_URL;
</script>

<style scoped>
.profile {
  padding: 16px 10%;
  height: auto;
  width: 100%;
  display: flex;
  justify-self: unset;
  box-sizing: border-box;
  overflow-x: hidden;
}
.profile-card {
  display: flex;
  width: 100%;
  max-width: 100%;
  height: 100%;
  gap: 24px;
  align-items: flex-start;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.profile-image {
  flex: 0 0 220px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.profile-body {
  flex: 1;
  padding: 30px;
}
.profile-name {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
}
.profile-text {
  margin: 0 0 20px;
  line-height: 1.8;
  color: #333;
}
.profile-subtitle {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
}
.profile-links {
  list-style: none;
  padding: 0 0 20px 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.profile-links a {
  color: #2c7be5;
  text-decoration: none;
  font-weight: 600;
}
.profile-links a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .profile {
    padding: 16px 4%;
  }
  .profile-card {
    flex-direction: column;
    align-items: center;
  }
  .profile-image {
    width: 100%;
    max-width: 320px;
    height: auto;
    aspect-ratio: 1 / 1;
  }
  .profile-body {
    width: 100%;
  }
}
</style>
