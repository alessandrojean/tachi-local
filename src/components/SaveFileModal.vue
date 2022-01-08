<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

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

function handleKeydown (event) {
  const e = event || window.event

  if (e.keyCode === 27) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div :class="['modal', open ? 'is-active' : '']">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">File preview</p>
        <button class="delete" aria-label="Close" @click="close"></button>
      </header>
      <section class="modal-card-body">
        <pre><code>{{ content }}</code></pre>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="close">Cancel</button>
        <a
          class="button is-primary"
          download="details.json"
          :href="downloadHref"
        >
          <span class="icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" class="hero-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
          </span>
          <span>Save file</span>
        </a>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-background {
  backdrop-filter: blur(4px);
}
</style>