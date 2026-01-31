<template>
  <!-- ===================== -->
  <!-- HOME -->
  <!-- ===================== -->
  <div class="container">
    <h1 class="title">イラスト一覧</h1>

    <p v-if="currentTag" class="filter-row">
      絞り込み中：#{{ currentTag }}
      <BaseButton variant="secondary" size="sm" @click="clearTag">解除</BaseButton>
    </p>

    <ul class="gallery">
      <li v-for="item in filteredList" :key="item.id" class="card">
        <router-link :to="`/illust/view/${item.id}`">
          <div v-if="item.hide_flg" class="spoiler-thumb">
            <span>ネタバレ有</span>
          </div>
          <img v-else :src="item.image" class="thumb" />
          <p class="card-title">{{ item.title || 'no title' }}</p>
        </router-link>

        <div class="tags">
          <span v-for="t in item.tags" :key="t" class="tag" @click.prevent="selectTag(t)">
            #{{ t }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useIllustList } from '@/composable/useIllustList.js';
import BaseButton from '@/src/components/ui/BaseButton.vue';

const { currentTag, filteredList, selectTag, clearTag } = useIllustList();
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
.filter-row {
  margin: 8px 0 16px;
}

.gallery {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.card {
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}
.card a {
  display: block;
  text-decoration: none;
  color: inherit;
}
.thumb {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  background: #fff;
}
.spoiler-thumb {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e5e5;
  color: #666;
  font-size: 24px;
}
.card-title {
  padding: 8px 10px;
  font-weight: 600;
}
.tags {
  padding: 0 10px 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  background: #f2f2f2;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}
</style>
