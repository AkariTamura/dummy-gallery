import { ref, Ref } from 'vue';
import { uploadIllust } from '@/util/api';

type Errors = {
  file?: string;
  title?: string;
  caption?: string;
  created_ymd?: string;
  api?: string;
};

export function useAdminIllustUpload() {
  const file = ref<File | null>(null);
  const uploading = ref<boolean>(false);

  // form fields
  const title = ref('');
  const caption = ref('');
  const todayYmd = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${dd}`;
  };

  const created_ymd = ref(todayYmd());
  const tags = ref('');
  const hide_flg = ref(false);
  const hide_Q = ref('');
  const hide_A = ref('');

  const errors = ref<Errors>({});

  const reset = () => {
    file.value = null;
    title.value = '';
    caption.value = '';
    created_ymd.value = todayYmd();
    tags.value = '';
    hide_flg.value = false;
    hide_Q.value = '';
    hide_A.value = '';
    errors.value = {};
  };

  const validate = () => {
    const err: Errors = {};
    if (!file.value) err.file = 'ファイルは必須です';
    if (!title.value.trim()) err.title = 'タイトルは必須です';
    if (!caption.value.trim()) err.caption = 'キャプションは必須です';
    if (!/^[0-9]{8}$/.test(created_ymd.value)) err.created_ymd = 'YYYYMMDD形式で入力してください';
    errors.value = err;
    return Object.keys(err).length === 0;
  };

  const submit = async () => {
    if (!validate()) return { ok: false };
    const fd = new FormData();
    if (file.value) fd.append('image', file.value);
    fd.append('title', title.value);
    fd.append('caption', caption.value);
    fd.append('created_ymd', created_ymd.value);
    fd.append('tags', tags.value);
    fd.append('hide_flg', hide_flg.value ? '1' : '0');
    fd.append('hide_Q', hide_Q.value);
    fd.append('hide_A', hide_A.value);

    uploading.value = true;
    try {
      const res = await uploadIllust(fd);
      if ((res as any)?.ok) {
        reset();
      } else {
        errors.value.api = (res as any)?.error || 'アップロードに失敗しました';
      }
      return res;
    } catch (e: any) {
      errors.value.api = e?.message || 'アップロードエラー';
      return { ok: false, error: errors.value.api };
    } finally {
      uploading.value = false;
    }
  };

  return {
    file,
    title,
    caption,
    created_ymd,
    tags,
    hide_flg,
    hide_Q,
    hide_A,
    errors,
    uploading,
    submit,
    reset,
  };
}
