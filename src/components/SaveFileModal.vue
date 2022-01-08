<script setup>
import { computed, ref } from 'vue'

import { Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue'
import { DownloadIcon } from '@heroicons/vue/solid'

const props = defineProps({ 
  open: Boolean,
  content: String
})

const emit = defineEmits(['close'])

function close () {
  emit('close')
}

const downloadHref = computed(() => {
  return URL.createObjectURL(
    new Blob([props.content], { type: 'application/json' })
  )
})

const downloadLink = ref(null)
</script>

<template>
  <Dialog
    :class="['modal', open ? 'is-active' : '']"
    :open="open"
    :initial-focus="downloadLink"
    @close="close"
  >
    <DialogOverlay class="modal-background" />
    <div class="modal-card">
      <header class="modal-card-head">
        <DialogTitle as="p" class="modal-card-title">File preview</DialogTitle>
        <button class="delete" aria-label="Close" @click="close"></button>
      </header>
      <section class="modal-card-body">
        <pre><code>{{ content }}</code></pre>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="close">Cancel</button>
        <a
          class="button is-link"
          download="details.json"
          :href="downloadHref"
          ref="downloadLink"
        >
          <span class="icon" aria-hidden="true">
            <DownloadIcon class="hero-icon" />
          </span>
          <span>Download file</span>
        </a>
      </footer>
    </div>
  </Dialog>
</template>
