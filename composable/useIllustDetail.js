import { ref, onMounted } from 'vue'
import { illustDetail } from '@/util/api.js'

export function useIllustDetail(id) {
  const illust = ref(null)
  const correctAnswer = ref(false)
  const userAnswer = ref('')

  const fetchDetail = async () => {
    if (!id) return
    try {
      illust.value = await illustDetail(id)
    } catch (e) {
      console.error('illustDetail error', e)
      illust.value = null
    }
  }

  const checkAnswer = () => {
    if (!illust.value) return

    if (userAnswer.value === illust.value.hide_A) {
      correctAnswer.value = true
    } else {
      alert('答えが違います')
    }
  }

  onMounted(fetchDetail)

  return { illust, correctAnswer, userAnswer, checkAnswer }
}
