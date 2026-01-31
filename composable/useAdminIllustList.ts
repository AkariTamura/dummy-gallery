import { ref, onMounted, Ref } from 'vue';
import { adminList, updateItem, deleteItem } from '@/util/api';

export function useAdminIllustList() {
  const list: Ref<any[]> = ref([]);
  const editId: Ref<string | null> = ref(null);
  const errors: Ref<Record<string, any>> = ref({});

  const fetchList = async () => {
    const res = await adminList();
    const data = (res as any).data ?? (res as any) ?? [];
    list.value = data.map((i: any) => ({
      ...i,
      hide_flg: !!i.hide_flg,
      hide_Q: i.hide_Q || '',
      hide_A: i.hide_A || '',
    }));
  };

  const startEdit = (id: string) => {
    errors.value = {};
    editId.value = id;
  };

  const cancelEdit = async () => {
    editId.value = null;
    await fetchList();
  };

  const validate = (item: any) => {
    const err: Record<string, string> = {};
    if (!item.title?.trim()) err.title = 'タイトルは必須です';
    if (!item.caption?.trim()) err.caption = 'キャプションは必須です';
    if (!/^[0-9]{8}$/.test(item.created_ymd)) err.created_ymd = 'YYYYMMDD形式';
    return err;
  };

  const update = async (item: any) => {
    const err = validate(item);
    errors.value[item.id] = err;
    if (Object.keys(err).length) return;

    const fd = new FormData();
    Object.entries({
      id: item.id,
      title: item.title,
      caption: item.caption,
      created_ymd: item.created_ymd,
      tags: item.tagsStr,
      hide_flg: item.hide_flg ? 1 : 0,
      hide_Q: item.hide_Q,
      hide_A: item.hide_A,
    }).forEach(([k, v]) => fd.append(k, v as any));

    await updateItem(fd);
    editId.value = null;
    await fetchList();
  };

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return;
    await deleteItem(id);
    await fetchList();
  };

  onMounted(fetchList);

  return { list, editId, errors, startEdit, cancelEdit, update, remove };
}
