import { ref, onMounted } from 'vue';
import { adminList, updateItem, deleteItem } from '@/util/api.js';

export function useAdminIllustList() {
  const list = ref([]);
  const editId = ref(null);
  const errors = ref({});

  const fetchList = async () => {
    const data = await adminList();
    list.value = data.map((i) => ({
      ...i,
      hide_flg: !!i.hide_flg,
      hide_Q: i.hide_Q || '',
      hide_A: i.hide_A || '',
    }));
  };

  const startEdit = (id) => {
    errors.value = {};
    editId.value = id;
  };

  const cancelEdit = async () => {
    editId.value = null;
    await fetchList();
  };

  const validate = (item) => {
    const err = {};
    if (!item.title?.trim()) err.title = 'タイトルは必須です';
    if (!item.caption?.trim()) err.caption = 'キャプションは必須です';
    if (!/^\d{8}$/.test(item.created_ymd)) err.created_ymd = 'YYYYMMDD形式';
    return err;
  };

  const update = async (item) => {
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
    }).forEach(([k, v]) => fd.append(k, v));

    await updateItem(fd);
    editId.value = null;
    await fetchList();
  };

  const remove = async (id) => {
    if (!confirm('削除しますか？')) return;
    await deleteItem(id);
    await fetchList();
  };

  onMounted(fetchList);

  return { list, editId, errors, startEdit, cancelEdit, update, remove };
}
