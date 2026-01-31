import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { illustList } from '@/util/api.js';

export function useIllustList() {
  const route = useRoute();
  const router = useRouter();
  const list = ref([]);
  const currentTag = ref(null);

  const fetchList = async () => {
    try {
      list.value = await illustList();
    } catch (e) {
      console.error('illustList error', e);
      list.value = [];
    }
  };

  const filteredList = computed(() => {
    if (!currentTag.value) {
      return list.value;
    }
    return list.value.filter((item) => item.tags?.includes(currentTag.value));
  });

  const applyQueryTag = (tag) => {
    if (!tag) {
      currentTag.value = null;
      return;
    }
    currentTag.value = String(tag);
  };

  const selectTag = (tag) => {
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
