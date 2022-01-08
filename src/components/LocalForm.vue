<script setup>
import { computed, reactive, ref } from 'vue'
import { object, string, array } from 'yup'

import { SearchIcon, UploadIcon } from '@heroicons/vue/solid'
import SaveFileModal from './SaveFileModal.vue'
import SearchModal from './SearchModal.vue'

const entry = reactive({
  title: '',
  author: '',
  artist: '',
  description: '',
  genre: '',
  status: '0'
})

const formattedEntry = computed(() => ({
  ...entry,
  genre: entry.genre.length > 0
    ? entry.genre.split(/,\s+/g)
        .map(genre => genre.trim())
    : []
}))

const formattedEntryStr = computed(() => {
  return JSON.stringify(formattedEntry.value, null, 2)
})

function handleSubmit () {
  saveModalOpen.value = true
}

const saveModalOpen = ref(false)
const searchModalOpen = ref(false)

const detailsSchema = object({
  title: string().required(),
  author: string().required(),
  artist: string().ensure(),
  description: string().ensure(),
  genre: array(string().required()).ensure(),
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

    Object.assign(entry, fileEntry, { genre: fileEntry.genre.join(', ') })
  } catch (err) {
    error.value = err.message || err
  }
}

function handleSelect (searchEntry) {
  Object.assign(entry, searchEntry)
}
</script>

<template>
  <section class="section py-0">
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
          <div class="field has-addons">
            <div class="control is-expanded">
              <input v-model="entry.title" type="text" id="title" class="input is-medium" placeholder="Ex. Death Note">
            </div>
            <div class="control">
              <button class="button is-medium" @click="searchModalOpen = true" type="button">
                <span class="icon" aria-hidden="true">
                  <SearchIcon class="hero-icon" />
                </span>
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label for="author" class="label">Authors</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input v-model="entry.author" type="text" id="author" class="input" placeholder="Ex. Tsugumi Ohba">
            </div>
            <p class="help">
              You can use any type of separator character when the series
              have multiple authors or artists.
            </p>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label for="artist" class="label">Artists</label>
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
              <textarea v-model="entry.description" class="textarea" id="description" placeholder="Ex. Ryuk, a god of death, drops his Death Note…"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label for="genre" class="label">Genres</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input v-model="entry.genre" type="text" id="genre" class="input" placeholder="Ex. Action, Thriller">
            </div>
            <p class="help">
              Use a comma (<code>,</code>) to separate the genres.
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
              <button class="button is-link" type="submit">
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
                      <UploadIcon class="hero-icon" />
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
      :open="saveModalOpen"
      :content="formattedEntryStr"
      @close="saveModalOpen = false"
    />

    <SearchModal
      :open="searchModalOpen"
      :search-term="entry.title"
      @select="handleSelect"
      @close="searchModalOpen = false"
    />
  </section>
</template>
