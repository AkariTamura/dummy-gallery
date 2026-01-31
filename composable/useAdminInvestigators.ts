import { ref, onMounted, Ref } from 'vue';
import { adminInvestigatorList, deleteInvestigator } from '@/util/api';

export function useAdminInvestigators() {
  const list: Ref<any[]> = ref([]);

  const fetchList = async () => {
    const res = await adminInvestigatorList();
    list.value = (res as any).data ?? (res as any) ?? [];
  };

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return;
    await deleteInvestigator(id);
    await fetchList();
  };

  onMounted(fetchList);

  return { list, remove };
}
