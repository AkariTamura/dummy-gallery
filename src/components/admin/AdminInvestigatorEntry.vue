<template>
  <div class="container">
    <h2>{{ props.editId ? '探索者編集' : '探索者登録' }}</h2>

    <form @submit.prevent="handleSubmit">
      <!-- 基本情報 -->
      <fieldset class="panel">
        <legend class="legend">基本情報</legend>

        <div class="form-row">
          <label>通称名 <span style="color: red">*</span></label
          ><br />
          <BaseInput v-model="formData.name" placeholder="探索者の名前" class="input-full" block />
          <div v-if="errors.name" style="color: red; font-size: 0.8em">{{ errors.name }}</div>
        </div>

        <div class="form-row-inline">
          <div class="form-row">
            <label>正式名</label><br />
            <BaseInput v-model="formData.fullname" placeholder="正式名" class="input-full" block />
          </div>
          <div class="form-row">
            <label>フリガナ</label><br />
            <BaseInput v-model="formData.kana" placeholder="フリガナ" class="input-full" block />
          </div>
        </div>

        <div class="form-row-inline">
          <div class="form-row">
            <label>年齢 <span style="color: red">*</span></label
            ><br />
            <BaseInput v-model="formData.age" placeholder="数字のみ" class="input-small" />
            <div v-if="errors.age" style="color: red; font-size: 0.8em">{{ errors.age }}</div>
          </div>

          <div class="form-row">
            <label>性別</label><br />
            <BaseSelect v-model="formData.sex" class="select-small">
              <option value=""></option>
              <option value="男">男</option>
              <option value="女">女</option>
              <option value="その他">その他</option>
            </BaseSelect>
          </div>

          <div class="form-row">
            <label>身長</label><br />
            <BaseInput
              v-model.number="formData.height"
              placeholder="cm"
              type="number"
              class="input-small"
            />
          </div>
        </div>

        <div class="form-row-inline">
          <div class="form-row">
            <label>職業 <span style="color: red">*</span></label
            ><br />
            <BaseInput v-model="formData.job" placeholder="職業" />
            <div v-if="errors.job" style="color: red; font-size: 0.8em">{{ errors.job }}</div>
          </div>

          <div class="form-row">
            <label>出身シナリオ</label><br />
            <BaseInput v-model="formData.pc_from" placeholder="出身シナリオ" />
          </div>

          <div class="form-row">
            <label>画像</label><br />
            <input ref="imageInput" type="file" accept="image/*" @change="onImageChange" />
            <div style="font-size: 12px; color: #666">トリミング範囲を調整できます（縦2:横1）</div>
          </div>
        </div>

        <div v-if="imageUrl" class="cropper-wrap">
          <img ref="cropperImage" :src="imageUrl" class="cropper-image" />
        </div>

        <div class="form-row">
          <label>特徴表</label><br />
          <BaseTextarea
            v-model="formData.feature"
            placeholder="無ければ空白"
            class="textarea-small"
            block
          />
        </div>

        <div class="form-row">
          <label>詳細</label><br />
          <BaseTextarea
            v-model="formData.detail"
            placeholder="背景など"
            class="textarea-large"
            block
          />
        </div>

        <div class="form-row">
          <label>URL</label><br />
          <div class="url-row">
            <BaseInput
              v-model="formData.url"
              placeholder="キャラクター保管所のURL"
              class="input-full"
              block
            />
            <BaseButton type="button" variant="secondary" size="sm" @click="fetchFromUrl"
              >URLから取得</BaseButton
            >
          </div>
        </div>
      </fieldset>

      <!-- ステータス -->
      <fieldset class="panel">
        <legend class="legend">ステータス</legend>

        <table class="status-table">
          <thead>
            <tr>
              <th class="col-label"></th>
              <th v-for="k in headerKeys" :key="k" class="col-head">
                <div class="col-head-title">{{ getStatusLabel(k) }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="row-label">基礎値</td>

              <td v-for="k in row1Keys" :key="'base-' + k" class="cell-base">
                <template v-if="selectRanges[k]">
                  <BaseSelect
                    v-model="formData.status[k].default"
                    :disabled="isDisabledStatus(k)"
                    :class="{ isDisable: isDisabledStatus(k) }"
                    class="status-select"
                  >
                    <option :value="null"></option>
                    <option v-for="n in selectRanges[k]" :key="n" :value="n">{{ n }}</option>
                  </BaseSelect>
                </template>
                <template v-else>
                  <BaseInput
                    v-model.number="formData.status[k].default"
                    :disabled="isDisabledStatus(k)"
                    :class="{ isDisable: isDisabledStatus(k) }"
                    type="number"
                    class="status-input-small"
                  />
                </template>
              </td>
            </tr>

            <tr>
              <td class="row-label">恒常的増減</td>

              <td v-for="k in row1Keys" :key="'ex1-' + k" class="cell-base">
                <BaseInput
                  v-model.number="formData.status[k].ex1"
                  type="number"
                  class="status-input-small"
                />
              </td>
            </tr>

            <tr>
              <td class="row-label">一時的増減</td>

              <td v-for="k in row1Keys" :key="'ex2-' + k" class="cell-base">
                <BaseInput
                  v-model.number="formData.status[k].ex2"
                  type="number"
                  class="status-input-small"
                />
              </td>
            </tr>

            <tr>
              <td class="row-label current">現在値</td>

              <td v-for="k in row1Keys" :key="'current-' + k" class="cell-current">
                <div class="current-value">{{ getCurrentValue(k) }}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- ステータス下段 -->
        <div class="lower-wrapper">
          <div class="lower-left">
            <table class="lower-table">
              <thead>
                <tr>
                  <th class="col-label left"></th>
                  <th v-for="k in placedKeys" :key="'lower-head-' + k" class="col-head">
                    <div class="col-head-title">{{ getStatusLabel(k) }}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="row-label">基礎値</td>
                  <td v-for="k in placedKeys" :key="'base2-' + k" class="cell-base">
                    <BaseInput
                      v-model.number="formData.status[k].default"
                      :disabled="isDisabledStatus(k)"
                      :class="{ isDisable: isDisabledStatus(k) }"
                      type="number"
                      class="status-input-small"
                    />
                  </td>
                </tr>

                <tr>
                  <td class="row-label">恒常的増減</td>
                  <td v-for="k in placedKeys" :key="'ex1-2-' + k" class="cell-base">
                    <BaseInput
                      v-model.number="formData.status[k].ex1"
                      type="number"
                      class="status-input-small"
                    />
                  </td>
                </tr>

                <tr>
                  <td class="row-label">一時的増減</td>
                  <td v-for="k in placedKeys" :key="'ex2-2-' + k" class="cell-base">
                    <BaseInput
                      v-model.number="formData.status[k].ex2"
                      type="number"
                      class="status-input-small"
                    />
                  </td>
                </tr>

                <tr>
                  <td class="row-label current">現在値</td>
                  <td v-for="k in placedKeys" :key="'current-2-' + k" class="cell-current">
                    <div class="current-value">{{ getCurrentValue(k) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="right-box">
            <div class="right-block">
              <div class="section-title" :class="{ overcap: isJobOverCap }">職業P</div>
              <div class="ratio-row" :class="{ overcap: isJobOverCap }">
                {{ totalEx1 }}/{{ eduTotalCap }}
              </div>
            </div>

            <div class="right-block">
              <div class="section-title" :class="{ overcap: isInterestOverCap }">興味P</div>
              <div class="ratio-row" :class="{ overcap: isInterestOverCap }">
                {{ totalEx2 }}/{{ intTotalCap }}
              </div>
            </div>
          </div>
          <div class="right-box">
            <div class="right-block">
              <div class="section-title">現在SAN</div>
              <div class="san-row">
                <BaseInput
                  v-model.number="formData.status.san.default"
                  type="number"
                  class="status-input-small"
                  :class="{ overcap: isSanOverMax }"
                />
                <span :class="{ overcap: isSanOverMax }">/{{ sanMax }}</span>
              </div>
            </div>

            <div>
              <div class="section-title">ダメージボーナス</div>
              <div class="db-row">{{ damageBonus }}</div>
            </div>
          </div>
        </div>
      </fieldset>

      <!-- 技能値 -->
      <fieldset class="panel">
        <legend class="legend">技能値</legend>

        <details v-for="categoryKey in skillCategories" :key="categoryKey" class="skill-details">
          <summary class="skill-summary">
            {{ getCategoryLabel(categoryKey) }}
          </summary>

          <div class="skill-body" :class="{ overcap: isJobOverCap || isInterestOverCap }">
            <table class="skill-table">
              <thead>
                <tr>
                  <th class="skill-head skill-name">技能名</th>
                  <th class="skill-head">初期値</th>
                  <th class="skill-head">職業P</th>
                  <th class="skill-head">興味P</th>
                  <th class="skill-head">成長P</th>
                  <th class="skill-head">その他</th>
                  <th class="skill-head">合計</th>
                  <th class="skill-head">操作</th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="(skillItem, skillKey) in formData.skill[categoryKey]"
                  :key="skillKey"
                >
                  <template
                    v-if="
                      typeof skillItem === 'object' &&
                      !Array.isArray(skillItem) &&
                      skillItem.label !== undefined
                    "
                  >
                    <tr>
                      <td class="skill-cell skill-name">
                        <div class="skill-name-wrap">
                          <template v-if="editingSkillKey === `${categoryKey}_${skillKey}`">
                            <BaseInput
                              v-model="skillItem.label"
                              type="text"
                              @blur="editingSkillKey = null"
                              @keyup.enter="editingSkillKey = null"
                              class="edit-input"
                              autofocus
                            />
                          </template>
                          <template v-else>
                            <span class="skill-name-text">{{ skillItem.label }}</span>
                            <span
                              @click="editingSkillKey = `${categoryKey}_${skillKey}`"
                              class="edit-icon"
                              title="ラベルを編集"
                            >
                              ✎
                            </span>
                          </template>
                        </div>
                      </td>
                      <td class="skill-cell">
                        <BaseInput
                          v-model.number="skillItem.default"
                          type="number"
                          class="skill-input isDisable"
                          disabled
                        />
                      </td>
                      <td class="skill-cell">
                        <BaseInput
                          v-model.number="skillItem.ex1"
                          type="number"
                          class="skill-input"
                        />
                      </td>
                      <td class="skill-cell">
                        <BaseInput
                          v-model.number="skillItem.ex2"
                          type="number"
                          class="skill-input"
                        />
                      </td>
                      <td class="skill-cell">
                        <BaseInput
                          v-model.number="skillItem.ex3"
                          type="number"
                          class="skill-input"
                        />
                      </td>
                      <td class="skill-cell">
                        <BaseInput
                          v-model.number="skillItem.ex4"
                          type="number"
                          class="skill-input"
                        />
                      </td>
                      <td class="skill-cell total">{{ getSkillTotal(skillItem) }}</td>
                      <td class="skill-cell action"></td>
                    </tr>
                  </template>

                  <template v-else-if="Array.isArray(skillItem)">
                    <tr v-for="(ex, exIdx) in skillItem" :key="`${skillKey}-${exIdx}`">
                      <td class="skill-cell skill-name">
                        <div class="skill-name-wrap">
                          <span class="skill-name-text">{{ ex.name }}</span>
                        </div>
                      </td>
                      <td class="skill-cell">
                        <BaseInput v-model.number="ex.default" type="number" class="skill-input" />
                      </td>
                      <td class="skill-cell">
                        <BaseInput v-model.number="ex.ex1" type="number" class="skill-input" />
                      </td>
                      <td class="skill-cell">
                        <BaseInput v-model.number="ex.ex2" type="number" class="skill-input" />
                      </td>
                      <td class="skill-cell">
                        <BaseInput v-model.number="ex.ex3" type="number" class="skill-input" />
                      </td>
                      <td class="skill-cell">
                        <BaseInput v-model.number="ex.ex4" type="number" class="skill-input" />
                      </td>
                      <td class="skill-cell total">{{ getSkillTotal(ex) }}</td>
                      <td class="skill-cell action">
                        <BaseButton
                          type="button"
                          variant="danger"
                          size="sm"
                          @click="removeExtraSkill(categoryKey, skillKey, exIdx)"
                          >削除</BaseButton
                        >
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>

            <!-- そのカテゴリに対する追加ボタン -->
            <div class="skill-extra">
              <template v-if="addingOpen[categoryKey]">
                <div class="skill-extra-row">
                  <BaseInput
                    v-model="newExtra[categoryKey].name"
                    placeholder="ラベル"
                    class="skill-name-input"
                  />
                  <BaseInput
                    v-model.number="newExtra[categoryKey].default"
                    type="number"
                    placeholder="初期値"
                    class="skill-input"
                  />
                  <BaseInput
                    v-model.number="newExtra[categoryKey].ex1"
                    type="number"
                    placeholder="職業P"
                    class="skill-input"
                  />
                  <BaseInput
                    v-model.number="newExtra[categoryKey].ex2"
                    type="number"
                    placeholder="興味P"
                    class="skill-input"
                  />
                  <BaseInput
                    v-model.number="newExtra[categoryKey].ex3"
                    type="number"
                    placeholder="成長P"
                    class="skill-input"
                  />
                  <BaseInput
                    v-model.number="newExtra[categoryKey].ex4"
                    type="number"
                    placeholder="その他"
                    class="skill-input"
                  />
                  <BaseButton
                    type="button"
                    variant="primary"
                    size="sm"
                    @click="confirmAddExtra(categoryKey)"
                    >追加</BaseButton
                  >
                  <BaseButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    @click="cancelAddExtra(categoryKey)"
                    >キャンセル</BaseButton
                  >
                </div>
              </template>
              <template v-else>
                <BaseButton
                  type="button"
                  variant="primary"
                  size="sm"
                  @click="openAddExtra(categoryKey)"
                  >＋ 追加</BaseButton
                >
              </template>
            </div>
          </div>
        </details>
      </fieldset>

      <!-- エラーメッセージ -->
      <div v-if="errors.api" style="color: red; font-weight: bold; margin-bottom: 16px">
        {{ errors.api }}
      </div>

      <!-- ボタン -->
      <div style="display: flex; gap: 8px">
        <BaseButton type="submit" variant="primary">
          {{ props.editId ? '更新' : '登録' }}
        </BaseButton>
        <BaseButton v-if="props.editId" type="button" variant="copy" @click="revertToOriginal">
          変更前に戻す
        </BaseButton>
        <BaseButton type="button" variant="secondary" @click="handleReset"> リセット </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { useAdminInvestigatorEntry } from '@/composable/useAdminInvestigatorEntry';
import investigatorInfo from '@/assets/json/investigatorInfo.json';
import BaseButton from '@/src/components/ui/BaseButton.vue';
import BaseInput from '@/src/components/ui/BaseInput.vue';
import BaseTextarea from '@/src/components/ui/BaseTextarea.vue';
import BaseSelect from '@/src/components/ui/BaseSelect.vue';
import { getSkillTotal } from '@/composable/useInvestigatorUtils';

const props = defineProps({
  editId: { type: [String, Number], default: null },
});

const {
  formData,
  errors,
  submit,
  reset,
  fetchFromUrl,
  setEditingId,
  revertToOriginal,
  setImageFile,
  setCropData,
} = useAdminInvestigatorEntry();
const router = useRouter();

watch(
  () => props.editId,
  (id) => {
    setEditingId(id);
  },
  { immediate: true }
);

const handleReset = () => {
  reset();
  if (props.editId) {
    router.replace({ path: '/admin/entry' });
  }
  clearCropper();
};

const handleSubmit = async () => {
  const ok = await submit();
  if (ok && props.editId) {
    router.replace({ path: '/admin/entry' });
  }
  if (ok) {
    clearCropper();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const imageInput = ref(null);
const cropperImage = ref(null);
const imageUrl = ref('');
let cropper = null;

const updateCropData = () => {
  if (!cropper) return;
  const data = cropper.getData(true);
  setCropData({ x: data.x, y: data.y, width: data.width, height: data.height });
};

const initCropper = async () => {
  await nextTick();
  if (!cropperImage.value) return;
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  cropper = new Cropper(cropperImage.value, {
    aspectRatio: 1 / 2,
    viewMode: 1,
    autoCropArea: 0.8,
    responsive: true,
    cropend: updateCropData,
    zoom: updateCropData,
    ready: updateCropData,
  });
};

const clearCropper = () => {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  imageUrl.value = '';
  if (imageInput.value) imageInput.value.value = '';
  setImageFile(null);
  setCropData(null);
};

const onImageChange = (e) => {
  const file = e.target.files?.[0] || null;
  setImageFile(file);
  if (!file) {
    clearCropper();
    return;
  }
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = URL.createObjectURL(file);
  initCropper();
};

onBeforeUnmount(() => {
  clearCropper();
});

// スキルラベルの編集状態を管理
const editingSkillKey = ref(null);

// スキルカテゴリの順序
const skillCategories = computed(() => {
  if (!investigatorInfo.skillDefaultList) return [];
  return Object.keys(investigatorInfo.skillDefaultList);
});

// 追加技能（配列）の形をテーブル入力用に正規化
const normalizeExtraSkills = () => {
  const skill = formData.value.skill || {};
  for (const category of Object.keys(skill)) {
    const items = skill[category] || {};
    for (const key of Object.keys(items)) {
      const val = items[key];
      if (Array.isArray(val)) {
        val.forEach((ex) => {
          if (ex.default === undefined) ex.default = Number(ex.value) || 0;
          if (ex.ex1 === undefined) ex.ex1 = null;
          if (ex.ex2 === undefined) ex.ex2 = null;
          if (ex.ex3 === undefined) ex.ex3 = null;
          if (ex.ex4 === undefined) ex.ex4 = null;
        });
      }
    }
  }
};
normalizeExtraSkills();

// ダメージボーナス計算
const damageBonus = computed(() => {
  const strStatus = formData.value.status.str || {};
  const sizStatus = formData.value.status.siz || {};
  const str =
    (Number(strStatus.default) || 0) + (Number(strStatus.ex1) || 0) + (Number(strStatus.ex2) || 0);
  const siz =
    (Number(sizStatus.default) || 0) + (Number(sizStatus.ex1) || 0) + (Number(sizStatus.ex2) || 0);
  const total = str + siz;

  if (total >= 2 && total <= 12) return '-1d6';
  if (total >= 13 && total <= 16) return '-1d4';
  if (total >= 17 && total <= 24) return '0';
  if (total >= 25 && total <= 32) return '+1d4';
  if (total >= 33 && total <= 40) return '+1d6';
  if (total >= 41 && total <= 46) return '+2d6';
  if (total >= 57 && total <= 72) return '+3d6';
  if (total >= 73 && total <= 88) return '+4d6';

  // 指定のレンジ外は 0 を返す
  return '0';
});

// カテゴリのラベルを取得
const getCategoryLabel = (key) => {
  const labels = {
    combat: '戦闘',
    exp: '探索',
    act: '行動',
    neg: '交渉',
    know: '知識',
  };
  return labels[key] || key;
};

// ステータスのラベルを investigatorInfo.statusList から取得
const getStatusLabel = (statusKey) => {
  if (statusKey === 'san') return '現在SAN';
  if (!investigatorInfo.statusList) return statusKey.toUpperCase();
  for (const [label, val] of Object.entries(investigatorInfo.statusList)) {
    if (val === statusKey) return label;
  }
  return statusKey.toUpperCase();
};

// 入力禁止にするステータスの判定
const disabledStatusKeys = ['hp', 'mp', 'ini_san', 'idea', 'know', 'luck'];
const isDisabledStatus = (key) => disabledStatusKeys.includes(key);

// 現在値（基礎値 + 恒常的増減 + 一時的増減）を取得
const getCurrentValue = (key) => {
  // 'san' は ini_san の合計を使う
  if (key === 'san') {
    const s = formData.value.status['ini_san'] || {};
    const base = Number(s.default) || 0;
    const ex1 = Number(s.ex1) || 0;
    const ex2 = Number(s.ex2) || 0;
    return base + ex1 + ex2;
  }
  const s = formData.value.status[key] || {};
  const base = Number(s.default) || 0;
  const ex1 = Number(s.ex1) || 0;
  const ex2 = Number(s.ex2) || 0;
  return base + ex1 + ex2;
};

// `getSkillTotal` は composable に移動済み（import を利用）

// 全技能の ex1/ex2 合計を取得
const sumSkillPoints = (field) => {
  let total = 0;
  const skill = formData.value.skill || {};
  for (const category of Object.keys(skill)) {
    const items = skill[category] || {};
    for (const key of Object.keys(items)) {
      const val = items[key];
      if (Array.isArray(val)) {
        val.forEach((ex) => {
          total += Number(ex?.[field]) || 0;
        });
      } else if (val && typeof val === 'object') {
        total += Number(val?.[field]) || 0;
      }
    }
  }
  return total;
};

const totalEx1 = computed(() => sumSkillPoints('ex1'));
const totalEx2 = computed(() => sumSkillPoints('ex2'));
const eduTotalCap = computed(() => (Number(formData.value.status.edu?.default) || 0) * 20);
const intTotalCap = computed(() => (Number(formData.value.status.int?.default) || 0) * 10);
const isJobOverCap = computed(
  () => (Number(totalEx1.value) || 0) > (Number(eduTotalCap.value) || 0)
);
const isInterestOverCap = computed(
  () => (Number(totalEx2.value) || 0) > (Number(intTotalCap.value) || 0)
);

// クトゥルフ神話の合計を取得して SAN 上限を算出
const cthulhuTotal = computed(() => {
  const skill = formData.value.skill || {};
  for (const category of Object.keys(skill)) {
    const items = skill[category] || {};
    for (const key of Object.keys(items)) {
      const val = items[key];
      if (Array.isArray(val)) {
        const found = val.find((ex) => ex?.name === 'クトゥルフ神話');
        if (found) return getSkillTotal(found);
      } else if (val && typeof val === 'object' && val.label === 'クトゥルフ神話') {
        return getSkillTotal(val);
      }
    }
  }
  return 0;
});

const sanMax = computed(() => 99 - (Number(cthulhuTotal.value) || 0));
const isSanOverMax = computed(
  () => (Number(formData.value.status.san?.default) || 0) > (Number(sanMax.value) || 0)
);

// テーブルの行分割: 上段と下段のキー
const row1Keys = ['str', 'con', 'pow', 'dex', 'app', 'siz', 'int', 'edu', 'hp', 'mp'];

// ヘッダーに1行で全キーを表示する配列（メインテーブル用）
const headerKeys = [...row1Keys];

// select 用のレンジ定義（基礎値をセレクトボックスで選べるようにする）
const makeRange = (min, max) => {
  const a = [];
  for (let i = min; i <= max; i++) a.push(i);
  return a;
};
const selectRanges = {
  str: makeRange(3, 18),
  con: makeRange(3, 18),
  pow: makeRange(3, 18),
  dex: makeRange(3, 18),
  app: makeRange(3, 18),
  siz: makeRange(8, 18),
  int: makeRange(8, 18),
  edu: makeRange(9, 21),
};

// 下段（ini_san 等）をどのメイン列の下に配置するか（インデックス）
const lowerPlacement = { ini_san: 0, idea: 4, luck: 7, know: 9 };
// インデックス -> key の配列（テンプレート内で参照しやすくする）
const placementIndexToKey = headerKeys.map(
  (_, i) => Object.keys(lowerPlacement).find((k) => lowerPlacement[k] === i) || null
);

// 実際に表示する下段キーの配列（空セルを作らないために配置済みのキーのみ）
const placedKeys = computed(() => placementIndexToKey.filter((k) => !!k));

// 追加技能の入力状態管理
const addingOpen = ref({});
const newExtra = ref({});

const openAddExtra = (category) => {
  addingOpen.value[category] = true;
  newExtra.value[category] = { name: '', default: 0, ex1: 0, ex2: 0, ex3: 0, ex4: 0 };
};

const cancelAddExtra = (category) => {
  addingOpen.value[category] = false;
  newExtra.value[category] = { name: '', default: 0, ex1: 0, ex2: 0, ex3: 0, ex4: 0 };
};

const findExtraKey = (category) => {
  const items = formData.value.skill[category] || {};
  for (const k of Object.keys(items)) {
    if (Array.isArray(items[k])) return k;
  }
  // フォールバックキーを作成
  const fallback = `${category}et`;
  items[fallback] = [];
  formData.value.skill[category] = items;
  return fallback;
};

const confirmAddExtra = (category) => {
  const payload = newExtra.value[category];
  if (!payload || !payload.name?.trim()) return;
  const key = findExtraKey(category);
  formData.value.skill[category][key].push({
    name: payload.name.trim(),
    default: Number(payload.default) || 0,
    ex1: Number(payload.ex1) || 0,
    ex2: Number(payload.ex2) || 0,
    ex3: Number(payload.ex3) || 0,
    ex4: Number(payload.ex4) || 0,
  });
  cancelAddExtra(category);
};

const removeExtraSkill = (category, key, index) => {
  const items = formData.value.skill?.[category]?.[key];
  if (!Array.isArray(items)) return;
  if (index < 0 || index >= items.length) return;
  items.splice(index, 1);
};
</script>

<style scoped>
.isDisable {
  background: #333;
  color: #fff;
}
.isDisable::placeholder {
  color: #ddd;
}

.status-grid {
  margin-top: 8px;
}
.status-block input {
  box-sizing: border-box;
}

/* Layout helpers */
.container {
  padding: 16px 10%;
}
.panel {
  border: 1px solid #ccc;
  padding: 12px;
  margin-bottom: 16px;
}
.legend {
  font-weight: 600;
}
.form-row {
  margin-bottom: 8px;
}
.form-row-inline {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 8px;
}
.form-row-inline .form-row {
  margin-bottom: 0;
}
.url-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.url-row .input-full {
  flex: 1;
}

/* Inputs */
.input-full {
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
}
.input-small {
  width: 100px;
  padding: 4px;
  box-sizing: border-box;
}
.textarea-small {
  width: 100%;
  height: 80px;
  padding: 4px;
  box-sizing: border-box;
}
.textarea-large {
  width: 100%;
  height: 100px;
  padding: 4px;
  box-sizing: border-box;
}
.select-small {
  width: 72px;
  padding: 4px;
  text-align: center;
  box-sizing: border-box;
}

/* Status tables */
.status-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.col-label {
  width: 160px;
  padding: 8px;
  border-bottom: 1px solid #ddd;
}
.col-head {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}
.col-head-title {
  font-weight: 600;
}
.row-label {
  text-align: left;
  padding: 8px;
  font-weight: 600;
}
.cell-base {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}
.status-select {
  width: 72px;
  padding: 4px;
  text-align: center;
}
.status-input-small {
  width: 72px;
  padding: 4px;
  text-align: center;
  box-sizing: border-box;
}
.row-label.current,
.cell-current {
  background: #f7f7f7;
}
.current-value {
  font-weight: 600;
  padding: 8px;
}

/* Lower section */
.lower-wrapper {
  display: flex;
  width: 100%;
  justify-content: start;
  gap: 16px;
  margin-top: 8px;
}
.lower-left {
  width: 80%;
}
.lower-table {
  width: 80%;
  border-collapse: collapse;
  text-align: center;
}
.left.col-label {
  text-align: left;
}

/* Right info box */
.right-box {
  width: 20%;
  border: 1px solid #eee;
  padding: 30px;
  margin: 10px;
  border-radius: 4px;
  box-sizing: border-box;
}
.right-block {
  margin-bottom: 12px;
}
.section-title {
  font-weight: 600;
  margin-bottom: 6px;
}
.san-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.db-row {
  font-size: 1.1em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.ratio-row {
  font-size: 1.05em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.section-title.overcap,
.ratio-row.overcap {
  color: #d00;
}
.san-row .overcap {
  color: #d00;
}

/* Skill area */
.skill-details {
  margin-bottom: 16px;
}
.skill-summary {
  cursor: pointer;
  font-weight: 600;
  padding: 8px;
  background: #f5f5f5;
}
.edit-input {
  width: 100%;
  padding: 4px;
  border: 1px solid #007bff;
  box-sizing: border-box;
}
.edit-icon {
  cursor: pointer;
  margin-left: 6px;
  color: #888;
  font-size: 1.2em;
}
.skill-input {
  width: 100px;
  padding: 4px;
  box-sizing: border-box;
}
.skill-body {
  padding: 12px;
}
.skill-body.overcap {
  background: #ffdddd;
}
.skill-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.skill-head {
  padding: 6px;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
  background: #f7f7f7;
}
.skill-name {
  text-align: left;
  width: 220px;
}
.skill-cell {
  padding: 6px;
  border-bottom: 1px solid #f0f0f0;
}
.skill-name-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.skill-name-text {
  user-select: none;
}
.skill-cell.total {
  font-weight: 600;
}

.cropper-wrap {
  margin: 8px 0 12px;
  max-width: 360px;
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
}
.cropper-image {
  width: 100%;
  display: block;
}
.skill-cell.action {
  width: 90px;
}
.skill-extra {
  margin-top: 8px;
}
.skill-extra-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.skill-name-input {
  flex: 1;
  min-width: 160px;
  max-width: 250px;
  padding: 4px;
  box-sizing: border-box;
}

/* Buttons */

@media (max-width: 768px) {
  .container {
    padding: 16px 4%;
  }
  .form-row-inline {
    flex-direction: column;
    align-items: stretch;
  }
  .url-row {
    flex-direction: column;
    align-items: stretch;
  }
  .status-table,
  .lower-table,
  .skill-table {
    display: block;
    overflow-x: auto;
  }
  .lower-wrapper {
    flex-direction: column;
  }
  .lower-left {
    width: 100%;
  }
  .right-box {
    width: 100%;
    margin: 0 0 12px;
    padding: 16px;
  }
  .skill-name {
    width: 160px;
  }
  .skill-extra-row {
    flex-direction: column;
    align-items: stretch;
  }
  .skill-name-input {
    max-width: none;
  }
}
</style>
