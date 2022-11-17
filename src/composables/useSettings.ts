import { useLocalStorage } from '@vueuse/core'

const useEnglishTitle = useLocalStorage('use_english_title', false)

export default function useSettings() {
  return { useEnglishTitle }
}
