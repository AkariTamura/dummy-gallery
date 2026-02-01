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
              <BaseButton title="タイトルやキャプション、タグ、秘匿情報を編集出来ます" variant="secondary" @click="startEdit(item.id)">編集</BaseButton>
              <BaseButton title="埋め込み画像のトリミングが出来ます" variant="copy" @click="openTrimModal(item)">OGP画像設定</BaseButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- トリミングモーダル -->
    <div v-if="showTrimModal" class="modal-overlay" @click.self="closeTrimModal">
      <div class="modal-content">
        <h3>OGP画像設定</h3>
        <div class="trim-container">
          <canvas ref="trimCanvas" class="trim-canvas"></canvas>
        </div>
        <div class="trim-controls">
          <BaseButton variant="primary" @click="saveTrimmedImage" :disabled="isSaving">保存</BaseButton>
          <BaseButton variant="secondary" @click="closeTrimModal">キャンセル</BaseButton>
        </div>
        <p class="trim-hint">画像をドラッグして位置を調整してください</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useAdminIllustList } from '@/composable/useAdminIllustList';
import { illustDetail, uploadOgpImage } from '@/util/api';
import BaseButton from '@/src/components/ui/BaseButton.vue';
import BaseInput from '@/src/components/ui/BaseInput.vue';
import BaseTextarea from '@/src/components/ui/BaseTextarea.vue';

const { list, editId, errors, startEdit, cancelEdit, update, remove } = useAdminIllustList();

// トリミング機能
const showTrimModal = ref(false);
const currentTrimItem = ref(null);
const trimCanvas = ref(null);
const trimCtx = ref(null);
const trimImage = ref(null);
const imageScale = ref(1);
const imageOffsetX = ref(0);
const imageOffsetY = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const isSaving = ref(false);

const TRIM_WIDTH = 800;
const TRIM_HEIGHT = 400; // 1:2 ratio (height:width)
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

const openTrimModal = async (item) => {
  currentTrimItem.value = item;
  showTrimModal.value = true;
  
  await nextTick();
  
  const canvas = trimCanvas.value;
  if (!canvas) return;
  
  canvas.width = TRIM_WIDTH;
  canvas.height = TRIM_HEIGHT;
  trimCtx.value = canvas.getContext('2d');
  
  // 元画像を取得するために詳細APIを呼び出す
  try {
    const result = await illustDetail(String(item.id));
    
    // エラーの場合のみ ok: false が返る
    if (result.ok === false) {
      console.error('API failed:', result);
      alert('画像情報の取得に失敗しました: ' + (result.error || '不明なエラー'));
      closeTrimModal();
      return;
    }
    
    // 成功時はイラストデータがそのまま返る
    console.log('Image URL:', result.image);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      trimImage.value = img;
      
      // 画像をトリミング領域に収まるようスケール計算
      const scaleX = TRIM_WIDTH / img.width;
      const scaleY = TRIM_HEIGHT / img.height;
      imageScale.value = Math.min(scaleX, scaleY); // 画像全体が見えるように
      
      // 初期位置を中央に
      constrainImagePosition();
      
      drawTrimCanvas();
    };
    img.onerror = (e) => {
      console.error('Image load error:', e);
      console.error('Image src:', img.src);
      alert('画像の読み込みに失敗しました: ' + img.src);
      closeTrimModal();
    };
    // 元画像のパス（サムネイルではなく）
    img.src = result.image;
    
    // ドラッグイベント設定
    canvas.addEventListener('mousedown', onTrimMouseDown);
    canvas.addEventListener('mousemove', onTrimMouseMove);
    canvas.addEventListener('mouseup', onTrimMouseUp);
    canvas.addEventListener('mouseleave', onTrimMouseUp);
    canvas.addEventListener('wheel', onTrimWheel, { passive: false });
  } catch (error) {
    console.error('画像読み込みエラー:', error);
    alert('画像の読み込みに失敗しました');
    closeTrimModal();
  }
};

const drawTrimCanvas = () => {
  const ctx = trimCtx.value;
  const img = trimImage.value;
  if (!ctx || !img) return;
  
  ctx.clearRect(0, 0, TRIM_WIDTH, TRIM_HEIGHT);
  ctx.drawImage(
    img,
    imageOffsetX.value,
    imageOffsetY.value,
    img.width * imageScale.value,
    img.height * imageScale.value
  );
  
  // 枠線を描画
  ctx.strokeStyle = '#00f';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, TRIM_WIDTH, TRIM_HEIGHT);
};

const onTrimMouseDown = (e) => {
  isDragging.value = true;
  const rect = trimCanvas.value.getBoundingClientRect();
  dragStartX.value = e.clientX - rect.left - imageOffsetX.value;
  dragStartY.value = e.clientY - rect.top - imageOffsetY.value;
};

const onTrimMouseMove = (e) => {
  if (!isDragging.value) return;
  const rect = trimCanvas.value.getBoundingClientRect();
  imageOffsetX.value = e.clientX - rect.left - dragStartX.value;
  imageOffsetY.value = e.clientY - rect.top - dragStartY.value;
  constrainImagePosition();
  drawTrimCanvas();
};

const onTrimMouseUp = () => {
  isDragging.value = false;
};

const onTrimWheel = (e) => {
  e.preventDefault();
  const img = trimImage.value;
  if (!img) return;
  
  const rect = trimCanvas.value.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // マウス位置を画像座標に変換
  const imgX = (mouseX - imageOffsetX.value) / imageScale.value;
  const imgY = (mouseY - imageOffsetY.value) / imageScale.value;
  
  // ズーム
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, imageScale.value * delta));
  
  // マウス位置を中心にズーム
  imageOffsetX.value = mouseX - imgX * newScale;
  imageOffsetY.value = mouseY - imgY * newScale;
  imageScale.value = newScale;
  
  constrainImagePosition();
  drawTrimCanvas();
};

const constrainImagePosition = () => {
  const img = trimImage.value;
  if (!img) return;
  
  const imgWidth = img.width * imageScale.value;
  const imgHeight = img.height * imageScale.value;
  
  // トリミング領域が画像の範囲内に収まるように制限
  // 画像がトリミング領域より小さい場合は中央配置
  if (imgWidth < TRIM_WIDTH) {
    imageOffsetX.value = (TRIM_WIDTH - imgWidth) / 2;
  } else {
    // 画像がトリミング領域より大きい場合は範囲内に制限
    imageOffsetX.value = Math.min(0, Math.max(TRIM_WIDTH - imgWidth, imageOffsetX.value));
  }
  
  if (imgHeight < TRIM_HEIGHT) {
    imageOffsetY.value = (TRIM_HEIGHT - imgHeight) / 2;
  } else {
    imageOffsetY.value = Math.min(0, Math.max(TRIM_HEIGHT - imgHeight, imageOffsetY.value));
  }
};

const saveTrimmedImage = async () => {
  if (!currentTrimItem.value || isSaving.value) return;
  
  isSaving.value = true;
  
  try {
    const canvas = trimCanvas.value;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    
    console.log('Saving OGP image for ID:', currentTrimItem.value.id);
    console.log('Blob size:', blob.size);
    
    const result = await uploadOgpImage(currentTrimItem.value.id, blob);
    console.log('Upload response:', result);
    
    if (result.ok === false) {
      throw new Error(result.error || 'アップロード失敗');
    }
    closeTrimModal();
  } catch (error) {
    console.error('OGP画像保存エラー:', error);
    alert('保存に失敗しました: ' + (error.message || error));
  } finally {
    isSaving.value = false;
  }
};

const closeTrimModal = () => {
  showTrimModal.value = false;
  currentTrimItem.value = null;
  trimImage.value = null;
  
  const canvas = trimCanvas.value;
  if (canvas) {
    canvas.removeEventListener('mousedown', onTrimMouseDown);
    canvas.removeEventListener('mousemove', onTrimMouseMove);
    canvas.removeEventListener('mouseup', onTrimMouseUp);
    canvas.removeEventListener('mouseleave', onTrimMouseUp);
    canvas.removeEventListener('wheel', onTrimWheel);
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}
.trim-container {
  margin: 16px 0;
  display: flex;
  justify-content: center;
}
.trim-canvas {
  border: 2px solid #ddd;
  cursor: move;
  max-width: 100%;
  height: auto;
}
.trim-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}
.trim-hint {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 8px;
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
