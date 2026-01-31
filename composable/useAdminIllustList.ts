import { ref, onMounted, Ref } from 'vue';
import { adminList, updateItem, deleteItem } from '@/util/api';

type IllustItem = {
  id: number;
  title: string;
  caption: string;
  created_ymd: string;
  tagsStr?: string;
  hide_flg: boolean;
  hide_Q?: string;
  hide_A?: string;
  [key: string]: any;
};

export function useAdminIllustList() {
  const list = ref<IllustItem[]>([]);
  const editId = ref<number | null>(null);
  const errors = ref({});

  const fetchList = async () => {
    const res = await adminList();
    const data = res && res.data !== undefined ? res.data : res ?? [];

    const typedData: IllustItem[] = data as IllustItem[];
    list.value = typedData.map((i: IllustItem) => ({
      ...i,
      hide_flg: !!i.hide_flg,
      hide_Q: i.hide_Q || '',
      hide_A: i.hide_A || '',
    }));
  };

  const startEdit = (id: number) => {
    errors.value = {};
    editId.value = id;
  };

  const cancelEdit = async () => {
    editId.value = null;
    await fetchList();
  };

  interface ValidationError {
    title?: string;
    caption?: string;
    created_ymd?: string;
    [key: string]: string | undefined;
  }

  const validate = (item: IllustItem): ValidationError => {
    const err: ValidationError = {};
    if (!item.title?.trim()) err.title = 'タイトルは必須です';
    if (!item.caption?.trim()) err.caption = 'キャプションは必須です';
    if (!/^[0-9]{8}$/.test(item.created_ymd)) err.created_ymd = 'YYYYMMDD形式';
    return err;
  };

  const update = async (item: IllustItem): Promise<void> => {
    const err: ValidationError = validate(item);
    (errors.value as Record<number, ValidationError>)[item.id] = err;
    if (Object.keys(err).length) return;

    const fd = new FormData();
    interface FormDataFields {
      id: number;
      title: string;
      caption: string;
      created_ymd: string;
      tags: string | undefined;
      hide_flg: number;
      hide_Q: string | undefined;
      hide_A: string | undefined;
    }
    const fields: FormDataFields = {
      id: item.id,
      title: item.title,
      caption: item.caption,
      created_ymd: item.created_ymd,
      tags: item.tagsStr,
      hide_flg: item.hide_flg ? 1 : 0,
      hide_Q: item.hide_Q,
      hide_A: item.hide_A,
    };
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v as any));

    await updateItem(fd);
    editId.value = null;
    await fetchList();
  };

  interface RemoveFunction {
    (id: number): Promise<void>;
  }

  const remove: RemoveFunction = async (id: number): Promise<void> => {
    if (!confirm('削除しますか？')) return;
    await deleteItem(String(id));
    await fetchList();
  };

  onMounted(fetchList);

  return { list, editId, errors, startEdit, cancelEdit, update, remove };
}
