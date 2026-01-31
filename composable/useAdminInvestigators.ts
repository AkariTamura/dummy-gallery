import { ref, onMounted, Ref } from 'vue';
import { adminInvestigatorList, deleteInvestigator, updateInvestigatorCreatedAt } from '@/util/api';

export function useAdminInvestigators() {
  const list: Ref<any[]> = ref([]);

  const fetchList = async () => {
    const res = await adminInvestigatorList();
    list.value = (res as any).data ?? (res as any) ?? [];
  };

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return { ok: false, error: 'cancel' };

    try {
      const res = await deleteInvestigator(id);
      if (res?.ok) {
        try {
          await fetchList();
        } catch (e) {
          if (import.meta.env.DEV) console.error('fetchList after delete failed:', e);
        }
      }
      return res;
    } catch (e) {
      return { ok: false, error: (e as any)?.message || 'delete error' };
    }
  };

  const refresh = async () => {
    await fetchList();
  };

  const updateCreatedAt = async (id: string, createdAt?: string) => {
    try {
      const res = await updateInvestigatorCreatedAt(id, createdAt);
      if (res?.ok) {
        try {
          await fetchList();
        } catch (e) {
          if (import.meta.env.DEV) console.error('fetchList after updateCreatedAt failed:', e);
        }
      }
      return res;
    } catch (e) {
      return { ok: false, error: (e as any)?.message || 'update created_at error' };
    }
  };

  onMounted(fetchList);

  return { list, remove, refresh, updateCreatedAt };
}
