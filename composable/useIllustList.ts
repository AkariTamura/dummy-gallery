import { ref, computed, onMounted, watch, Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { illustList } from '@/util/api';
const DEV_LOG = import.meta.env.DEV;

export function useIllustList() {
  const route = useRoute();
  const router = useRouter();
  const list: Ref<any[]> = ref([]);
  const currentTag: Ref<string | null> = ref(null);

  const fetchList = async () => {
    try {
      const res = await illustList();
      if ((res as any).ok === false) {
        if (DEV_LOG) console.error('illustList error', res);
        list.value = [];
        return;
      }
      list.value = (res as any).data ?? (res as any) ?? [];
    } catch (e) {
      if (DEV_LOG) console.error('illustList error', e);
      list.value = [];
    }
  };

  const filteredList = computed(() => {
    if (!currentTag.value) {
      return list.value;
    }
    return list.value.filter((item: any) => item.tags?.includes(currentTag.value));
  });

  const applyQueryTag = (tag: any) => {
    if (!tag) {
      currentTag.value = null;
      return;
    }
    currentTag.value = String(tag);
  };

  const selectTag = (tag: string) => {
    currentTag.value = tag;
    router.push({ path: '/illust', query: { tag } });
  };

  const clearTag = () => {
    currentTag.value = null;
    router.push({ path: '/illust' });
  };

  watch(
    () => route.query.tag,
    (tag) => {
      applyQueryTag(tag);
    },
    { immediate: true }
  );

  onMounted(fetchList);

  return { list, currentTag, filteredList, selectTag, clearTag };
}
