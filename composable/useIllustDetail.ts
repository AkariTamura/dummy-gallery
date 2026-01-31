import { ref, onMounted, Ref } from 'vue';
import { illustDetail } from '@/util/api';

export function useIllustDetail(id: string | null) {
  const illust: Ref<any | null> = ref(null);
  const correctAnswer: Ref<boolean> = ref(false);
  const userAnswer: Ref<string> = ref('');

  const fetch = async (targetId?: string | null) => {
    const iid = targetId ?? id;
    if (!iid) return;
    const res = await illustDetail(String(iid));
    // API returns either { ok: true, data: {...} } or the object directly
    const payload = (res as any).data ?? (res as any) ?? null;
    illust.value = payload ?? null;
    // reset spoiler state when loading new item
    correctAnswer.value = false;
    userAnswer.value = '';
  };

  const checkAnswer = () => {
    if (!illust.value) return;
    if (userAnswer.value === illust.value.hide_A) {
      correctAnswer.value = true;
    } else {
      alert('答えが違います');
    }
  };

  onMounted(() => fetch());

  return { illust, correctAnswer, userAnswer, checkAnswer, fetch };
}
