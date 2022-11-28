<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { object, string, array } from 'yup'

import {
  ArrowUpTrayIcon,
  Cog8ToothIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/20/solid'
import SaveFileModal from './SaveFileModal.vue'
import SearchModal from './SearchModal.vue'
import SettingsModal from './SettingsModal.vue'

import type { TachiyomiEntry } from '../types/tachiyomi'

const entry = reactive<TachiyomiEntry>({
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

const detailsSchema = object({
  title: string().required(),
  author: string().required(),
  artist: string().ensure(),
  description: string().ensure(),
  genre: array(string().required()).ensure(),
  status: string().required().matches(/^[0123456]$/)
})

const error = ref(null)

async function handleFile (event: Event) {
  try {
    error.value = null

    const target = event.target as HTMLInputElement    
    const file = target.files!.item(0)

    if (!file) {
      return
    }

    const text = await file.text()

    const json = JSON.parse(text)
    const fileEntry = await detailsSchema.validate(json)

    Object.assign(entry, { 
      title: fileEntry.title,
      author: fileEntry.author,
      artist: fileEntry.artist,
      description: fileEntry.description,
      genre: fileEntry.genre.join(', '),
      status: fileEntry.status
    })
  } catch (err: any) {
    error.value = err.message || err
  }
}

function handleSelect (searchEntry: TachiyomiEntry) {
  Object.assign(entry, searchEntry)
}

const statusOptions = ref([
  'Unknown', 'Ongoing', 'Completed', 'Licensed', 
  'Publishing finished', 'Cancelled', 'On hiatus'
])

const searchModalOpen = ref(false)
const settingsModalOpen = ref(false)
</script>

<template>
  <section class="bg-white shadow-md md:rounded-2xl p-6">
    <form class="flex flex-col gap-2.5" @submit.prevent="handleSubmit" autocomplete="off">
      <article class="bg-red-100 text-red-900 rounded-xl" v-if="error">
        <div class="text-sm p-3">
          {{ error }}
        </div>
      </article>

      <div class="sm:flex gap-4">
        <div class="sm:text-right sm:w-32 shrink-0 mt-2 mb-1 sm:mb-0">
          <label for="title" class="font-semibold">Title</label>
        </div>
        <div class="flex-1 flex w-full">
          <input
            v-model.trim="entry.title"
            type="text"
            id="title"
            class="flex-1 min-w-0 !rounded-r-none"
            placeholder="Ex. Death Note"
          >

          <button
            type="button"
            class="rounded-l-none border-l-0 shrink-0"
            @click="searchModalOpen = true"
          >
            <MagnifyingGlassIcon class="w-5 h-5" />
            <span class="hidden sm:inline-block">Search</span>
          </button>
        </div>
      </div>

      <div class="sm:flex gap-4">
        <div class="sm:text-right sm:w-32 shrink-0 mt-2 mb-1 sm:mb-0">
          <label for="author" class="font-semibold">Authors</label>
        </div>
        <div class="flex-1">
          <input
            v-model.trim="entry.author"
            type="text"
            id="author"
            class="w-full"
            placeholder="Ex. Tsugumi Ohba"
          >
          <p class="text-xs text-gray-600 mt-1.5 mb-1">
            You can use any type of separator character when the series
            have multiple authors or artists.
          </p>
        </div>
      </div>

      <div class="sm:flex gap-4">
        <div class="sm:text-right sm:w-32 shrink-0 mt-2 mb-1 sm:mb-0">
          <label for="artist" class="font-semibold">Artists</label>
        </div>
        <div class="flex-1">
          <input
            v-model.trim="entry.artist"
            type="text"
            id="artist"
            class="w-full"
            placeholder="Ex. Takeshi Obata"
          >
        </div>
      </div>

      <div class="sm:flex gap-4">
        <div class="sm:text-right sm:w-32 shrink-0 mt-2 mb-1 sm:mb-0">
          <label for="description" class="font-semibold">Description</label>
        </div>
        <div class="flex-1">
          <textarea
            v-model.trim="entry.description"
            class="w-full h-32"
            id="description"
            placeholder="Ex. Ryuk, a god of death, drops his Death Note…"
          />
        </div>
      </div>

      <div class="sm:flex gap-4">
        <div class="sm:text-right sm:w-32 shrink-0 mt-2 mb-1 sm:mb-0">
          <label for="genre" class="font-semibold">Genres</label>
        </div>
        <div class="flex-1">
          <input
            v-model="entry.genre"
            type="text"
            id="genre"
            class="w-full"
            placeholder="Ex. Action, Thriller"
          >
          <p class="text-xs text-gray-600 mt-1.5 mb-1">
            Use a comma (<code>,</code>) to separate the genres.
          </p>
        </div>
      </div>

      <div class="sm:flex gap-4">
        <div class="sm:text-right sm:w-32 shrink-0 mt-2 mb-1 sm:mb-0">
          <label for="status" class="font-semibold">Status</label>
        </div>
        <div class="flex-1">
          <select v-model="entry.status" id="status">
            <option
              v-for="(option, optionIdx) in statusOptions"
              :key="optionIdx"
              :value="optionIdx"
            >
              {{ option }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-5 sm:pl-36">
        <button class="button-primary grow justify-center sm:grow-0 sm:justify-start" type="submit">
          Generate
        </button>

        <label class="grow sm:grow-0 sm:ml-auto">
          <input
            class="sr-only"
            type="file"
            name="file"
            accept="application/json"
            @change="handleFile"
          >
          <span class="button justify-center sm:justify-start">
            <ArrowUpTrayIcon class="w-5 h-5" />
            <span>Open file…</span>
          </span>
        </label>

        <button
          class="button-ghost p-2 shrink-0"
          type="button"
          aria-label="Settings"
          title="Settings"
          @click="settingsModalOpen = true"
        >
          <Cog8ToothIcon class="w-5 h-5 !ml-0" />
        </button>
      </div>
    </form>

    <SaveFileModal
      :open="saveModalOpen"
      :content="formattedEntryStr"
      @close="saveModalOpen = false"
    />

    <SettingsModal
      :open="settingsModalOpen"
      @close="settingsModalOpen = false"
    />

    <SearchModal
      :open="searchModalOpen"
      :search-term="entry.title"
      @select="handleSelect"
      @close="searchModalOpen = false"
    />
  </section>
</template>
