<script setup>
import { computed, reactive, ref } from 'vue'
import { object, string, array } from 'yup'

import SaveFileModal from './SaveFileModal.vue'

const entry = reactive({
  title: '',
  author: '',
  artist: '',
  description: '',
  genres: '',
  status: '0'
})

const formattedEntry = computed(() => ({
  ...entry,
  genres: entry.genres.split(/,\s+/g)
      .map(genre => genre.trim())
}))

const formattedEntryStr = computed(() => {
  return JSON.stringify(formattedEntry.value, null, 2)
})

function handleSubmit () {
  modalOpen.value = true
}

const modalOpen = ref(false)

function handleModalClose () {
  modalOpen.value = false
}

const detailsSchema = object({
  title: string().required(),
  author: string().required(),
  artist: string().ensure(),
  description: string().ensure(),
  genres: array(string().required()).ensure(),
  status: string().required().matches(/^[0123]$/)
})

const error = ref(null)

async function handleFile (event) {
  try {
    error.value = null
    
    const file = event.target.files.item(0)

    if (!file) {
      return
    }

    const text = await file.text()

    const json = JSON.parse(text)
    const fileEntry = await detailsSchema.validate(json)

    Object.assign(entry, fileEntry, { genres: fileEntry.genres.join(', ') })
  } catch (err) {
    error.value = err.message || err
  }
}
</script>

<template>
  <section class="section pt-0">
    <form class="box" @submit.prevent="handleSubmit">
      <article class="message is-danger" v-if="error">
        <div class="message-body p-3">
          {{ error }}
        </div>
      </article>

      <div class="field is-horizontal">
        <div class="field-label is-medium">
          <label for="title" class="label">Title</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input v-model="entry.title" type="text" id="title" class="input is-medium" placeholder="Ex. Death Note">
            </div>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label for="author" class="label">Author</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input v-model="entry.author" type="text" id="author" class="input" placeholder="Ex. Tsugumi Ohba">
            </div>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label for="artist" class="label">Artist</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input v-model="entry.artist" type="text" id="artist" class="input" placeholder="Ex. Takeshi Obata">
            </div>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label for="description" class="label">Description</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <textarea v-model="entry.description" class="textarea" id="description" placeholder="Ryuk, a god of death, drops his Death Note…"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label for="genres" class="label">Genres</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input v-model="entry.genres" type="text" id="genres" class="input" placeholder="Ex. Action, Thriller">
            </div>
            <p class="help">
              Separate the genres using the comma character (<code>,</code>).
            </p>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label for="status" class="label">Status</label>
        </div>
        <div class="field-body">
          <div class="field is-narrow">
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="entry.status" id="status">
                  <option value="0">Unknown</option>
                  <option value="1">Ongoing</option>
                  <option value="2">Completed</option>
                  <option value="3">Licensed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="field is-horizontal pt-5">
        <div class="field-label">
          <!-- Left empty for spacing -->
        </div>
        <div class="field-body">
          <div class="field is-flex is-justify-content-space-between">
            <div class="control">
              <button class="button is-primary" type="submit">
                Generate
              </button>
            </div>

            <div class="control">
             <div class="file">
                <label class="file-label">
                  <input
                    class="file-input"
                    type="file"
                    name="file"
                    accept="application/json"
                    @change="handleFile"
                  >
                  <span class="file-cta">
                    <span class="file-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" class="hero-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    </span>
                    <span class="file-label">
                      Open file…
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <SaveFileModal
      :open="modalOpen"
      :content="formattedEntryStr"
      @close="handleModalClose"
    />
  </section>
</template>
