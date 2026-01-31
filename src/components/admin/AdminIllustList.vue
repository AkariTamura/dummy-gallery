<template>
  <div class="container">
    <h2 class="title">イラスト一覧</h2>
    <table class="main-table">
      <thead>
        <tr>
          <th>サムネイル</th>
          <th>ID</th>
          <th>タイトル</th>
          <th>登録日</th>
          <th>キャプション</th>
          <th>タグ</th>
          <th>秘匿有無</th>
          <th>秘匿質問</th>
          <th>秘匿パス</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in list" :key="item.id">
          <td><img :src="item.image" class="thumb" /></td>
          <td class="cell-id">{{ item.id }}</td>

          <td v-if="editId === item.id">
            <BaseInput v-model="item.title" class="input-full" block />
            <div v-if="errors[item.id]?.title" class="error-text">
              {{ errors[item.id].title }}
            </div>
          </td>
          <td v-else class="text-wrap">{{ item.title }}</td>

          <td v-if="editId === item.id">
            <BaseInput v-model="item.created_ymd" class="input-small" />
            <div v-if="errors[item.id]?.created_ymd" class="error-text">
              {{ errors[item.id].created_ymd }}
            </div>
          </td>
          <td v-else class="text-center">{{ item.created_ymd }}</td>

          <td v-if="editId === item.id">
            <BaseTextarea v-model="item.caption" rows="5" class="textarea-large" block />
            <div v-if="errors[item.id]?.caption" class="error-text">
              {{ errors[item.id].caption }}
            </div>
          </td>
          <td v-else class="text-wrap">{{ item.caption }}</td>

          <td v-if="editId === item.id">
            <BaseInput v-model="item.tagsStr" class="input-full" block />
          </td>
          <td v-else class="text-wrap">{{ item.tagsStr }}</td>

          <td v-if="editId === item.id">
            <input type="checkbox" v-model="item.hide_flg" />
          </td>
          <td v-else class="text-center">{{ item.hide_flg ? '有' : '無' }}</td>

          <td v-if="editId === item.id">
            <BaseTextarea v-model="item.hide_Q" rows="5" class="textarea-small" block />
          </td>
          <td v-else class="text-wrap">{{ item.hide_Q }}</td>

          <td v-if="editId === item.id">
            <BaseInput v-model="item.hide_A" class="input-full" block />
          </td>
          <td v-else class="text-wrap">{{ item.hide_A }}</td>

          <td>
            <div v-if="editId === item.id" class="action-stack">
              <BaseButton variant="primary" @click="update(item)">保存</BaseButton>
              <BaseButton variant="danger" @click="remove(item.id)">削除</BaseButton>
              <BaseButton variant="secondary" @click="cancelEdit">キャンセル</BaseButton>
            </div>
            <div v-else class="action-stack">
              <BaseButton variant="secondary" @click="startEdit(item.id)">編集</BaseButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useAdminIllustList } from '@/composable/useAdminIllustList.js';
import BaseButton from '@/src/components/ui/BaseButton.vue';
import BaseInput from '@/src/components/ui/BaseInput.vue';
import BaseTextarea from '@/src/components/ui/BaseTextarea.vue';

const { list, editId, errors, startEdit, cancelEdit, update, remove } = useAdminIllustList();
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
.main-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
  table-layout: fixed;
}
.main-table th,
.main-table td {
  border: 1px solid #e0e0e0;
  padding: 8px;
  vertical-align: top;
}
.thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}
.cell-id {
  text-align: center;
  font-weight: 600;
}
.input-full {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}
.input-small {
  width: 120px;
  padding: 6px;
  box-sizing: border-box;
}
.textarea-large {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}
.textarea-small {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}
.text-wrap {
  word-break: break-word;
}
.text-center {
  text-align: center;
}
.action-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.error-text {
  color: #d00;
  font-size: 0.85em;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px 4%;
  }
  .main-table {
    display: block;
    overflow-x: auto;
  }
  .thumb {
    width: 60px;
    height: 60px;
  }
  .action-stack {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
