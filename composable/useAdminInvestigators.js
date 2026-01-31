import { ref, onMounted } from 'vue';
import {
  adminInvestigatorList,
  deleteInvestigator,
  updateInvestigatorCreatedAt,
} from '@/util/api.js';

export function useAdminInvestigators() {
  const list = ref([]);

  const formatNow = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  };

  const refresh = async () => {
    try {
      const data = await adminInvestigatorList();
      list.value = (data || []).map((inv) => {
        if (typeof inv.status === 'string') {
          try {
            inv.status = JSON.parse(inv.status);
          } catch {
            inv.status = {};
          }
        }
        if (typeof inv.skill === 'string') {
          try {
            inv.skill = JSON.parse(inv.skill);
          } catch {
            inv.skill = {};
          }
        }
        if (!inv.created_at) {
          inv.created_at = formatNow();
        }
        return inv;
      });
    } catch (e) {
      console.error('adminInvestigatorList error', e);
      list.value = [];
    }
  };

  const remove = async (id) => {
    if (!confirm('このキャラクターシートを削除しますか？')) return;
    const result = await deleteInvestigator(id);
    return result ?? { ok: false };
  };

  const updateCreatedAt = async (id, createdAt) => {
    if (!id) return { ok: false };
    const result = await updateInvestigatorCreatedAt(id, createdAt);
    return result ?? { ok: false };
  };

  onMounted(refresh);

  return { list, refresh, remove, updateCreatedAt };
}
