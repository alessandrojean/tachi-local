<script setup lang="ts">
import { computed, ref } from 'vue'

import { Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue'
import { ArrowDownTrayIcon, XCircleIcon } from '@heroicons/vue/20/solid'

const props = defineProps<{ 
  open: boolean,
  content: string
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

function close () {
  emit('close')
}

const downloadHref = computed(() => {
  return URL.createObjectURL(
    new Blob([props.content], { type: 'application/json' })
  )
})

const downloadLink = ref<HTMLElement>()
</script>

<template>
  <Dialog
    :class="{ hidden: !open }"
    :open="open"
    :initial-focus="downloadLink"
    @close="close"
  >
    <div class="fixed z-30 inset-0 flex flex-col items-center justify-center sm:py-6 sm:px-6 md:px-0 md:py-12 lg:py-16">
      <DialogOverlay
        class="absolute inset-0 bg-gray-900/80 supports-backdrop-blur:bg-gray-900/60 backdrop-blur"
      />

      <div class="relative flex flex-col justify-center w-full max-w-2xl max-h-full overflow-hidden bg-white sm:shadow-xl sm:rounded-2xl ring-1 ring-black/5">
        <header class="shrink-0 py-4 px-6 bg-gray-100 border-b flex justify-between items-center">
          <DialogTitle as="p" class="text-lg font-medium">
            File preview
          </DialogTitle>
          <button class="button-ghost button-rounded -mr-2" title="Close" aria-label="Close" @click="close">
            <XCircleIcon class="w-6 h-6 !ml-0" />
          </button>
        </header>
        <section class="flex-1 p-6">
          <div class="bg-gray-50 border rounded-lg p-4 text-sm">
            <pre class="w-full overflow-auto"><code>{{ content }}</code></pre>
          </div>
        </section>
        <footer class="shrink-0 py-4 px-6 bg-gray-100 border-t flex justify-between items-center">
          <button @click="close">Cancel</button>
          <a
            class="button button-primary"
            download="details.json"
            :href="downloadHref"
            ref="downloadLink"
          >
            <span class="icon" aria-hidden="true">
              <ArrowDownTrayIcon class="w-5 h-5" />
            </span>
            <span>Download file</span>
          </a>
        </footer>
      </div>
    </div>
  </Dialog>
</template>
