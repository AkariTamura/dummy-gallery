import { ref } from 'vue'
import { uploadIllust } from '@/util/api.js'

function getTodayYMD() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export function useAdminIllustUpload(onSuccess) {
  const file = ref(null)
  const title = ref('')
  const caption = ref('')
  const created_ymd = ref(getTodayYMD())
  const tags = ref('')
  const hide_flg = ref(false)
  const hide_Q = ref('')
  const hide_A = ref('')
  const errors = ref({})

  const validate = () => {
    const err = {}
    if (!file.value) err.file = 'ファイルを選択してください'
    if (!title.value) err.title = '必須'
    if (!caption.value) err.caption = '必須'
    if (!/^\d{8}$/.test(created_ymd.value)) err.created_ymd = 'YYYYMMDD'
    errors.value = err
    return !Object.keys(err).length
  }

  const reset = () => {
    file.value = null
    title.value = ''
    caption.value = ''
    created_ymd.value = getTodayYMD()
    tags.value = ''
    hide_flg.value = false
    hide_Q.value = ''
    hide_A.value = ''
    errors.value = {}
  }

  const submit = async () => {
    if (!validate()) return

    try {
      const fd = new FormData()
      fd.append('image', file.value)
      fd.append('title', title.value)
      fd.append('caption', caption.value)
      fd.append('created_ymd', created_ymd.value)
      fd.append('tags', tags.value)
      fd.append('hide_flg', hide_flg.value ? 1 : 0)
      fd.append('hide_Q', hide_Q.value)
      fd.append('hide_A', hide_A.value)

      console.log('アップロードFormData内容:')
      for (let pair of fd.entries()) {
        console.log(pair[0], pair[1])
      }
      await uploadIllust(fd)
      reset()
      onSuccess?.()
    } catch (e) {
      console.error('upload error:', e)
      errors.value.api = 'アップロード失敗: ' + (e.message || '不明なエラー')
    }
  }

  return {
    file, title, caption, created_ymd, tags,
    hide_flg, hide_Q, hide_A,
    errors, submit, reset
  }
}
