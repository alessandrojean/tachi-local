<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'

import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  RadioGroup,
  RadioGroupLabel,
  RadioGroupOption
} from '@headlessui/vue'
import {
  CheckCircleIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  XCircleIcon
} from '@heroicons/vue/20/solid'

import * as AL from '../types/anilist'
import { TachiyomiEntry, TachiyomiStatus } from '../types/tachiyomi'
import useSettings from '../composables/useSettings'

const props = defineProps<{ 
  open: boolean,
  searchTerm?: string
}>()

const { open } = toRefs(props)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', entry: TachiyomiEntry): void
}>()

function close () {
  emit('close')
}

const { useEnglishTitle } = useSettings()

const query = ref(props.searchTerm || '')
const error = ref(null)
const loading = ref(false)
const results = ref<AL.AnilistMedia[]>([])
const selection = ref<AL.AnilistMedia>()
const searchedOnce = ref(false)

watch(open, newValue => {
  if (newValue) {
    query.value = props.searchTerm || ''
    clear()

    if (query.value.length > 0) {
      search()
    }
  }
})

function clear () {
  error.value = null
  loading.value = false
  results.value = []
  selection.value = undefined
  searchedOnce.value = false
}

watch(query, newValue => {
  if (newValue.length === 0) {
    clear()
  }
})

async function search () {
  const graphqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: MANGA, format_not: NOVEL) {
          id
          title {
            romaji
            english
          }
          status
          description
          genres
          format
          coverImage { extraLarge }
          staff(perPage: 25) {
            edges {
              role
              node {
                id
                name { full }
              }
            }
          }
        }
      }
    }
  `

  try {
    clear()
    loading.value = true

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          search: query.value
        }
      })
    })

    const result = await (response.json() as Promise<AL.AnilistPaginatedMedia>)

    results.value = result.data.Page.media || []

    if (results.value.length === 1) {
      selection.value = results.value[0]
    }

    searchedOnce.value = true
  } catch (e: any) {
    error.value = e.message || e
  } finally {
    loading.value = false
  }
}

const ALLOWED_ROLES = ['Art', 'Story', 'Story&Art', 'Story & Art']

function authors (title: AL.AnilistMedia): string {
  const authorsText = title.staff.edges
    .filter(edge => ALLOWED_ROLES.includes(edge.role))
    .map(edge => edge.node.name.full)
    .sort()
    .join(', ')

  return authorsText.length > 0 ? authorsText : 'Unknown authors'
}

function tagClass (status: AL.AnilistStatus): string {
  const mapping: Record<AL.AnilistStatus, string> = {
    CANCELLED: 'bg-red-100 text-red-900',
    FINISHED: 'bg-emerald-100 text-emerald-800',
    HIATUS: 'bg-red-100 text-red-900',
    NOT_YET_RELEASED: 'bg-red-100 text-red-900',
    RELEASING: 'bg-blue-100 text-blue-800'
  }

  return mapping[status]
}

function statusText (status: AL.AnilistStatus): string {
  const mapping: Record<AL.AnilistStatus, string> = {
    CANCELLED: 'CANCELLED',
    FINISHED: 'COMPLETED',
    HIATUS: 'HIATUS',
    NOT_YET_RELEASED: 'UNKNOWN',
    RELEASING: 'ONGOING'
  }

  return mapping[status]
}

function formatText (format: AL.AnilistFormat): string {
  const mapping: Record<AL.AnilistFormat, string> = {
    MANGA: 'Manga',
    ONE_SHOT: 'One-shot'
  }

  return mapping[format] || 'Unknown format'
}

function unescapeEntities (string?: string): string {
  if (!string) {
    return ''
  }

  const unescapeMapping: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': '\'',
    '&#x60;': '`'
  }

  const regexSrc = `(?:${Object.keys(unescapeMapping).join('|')})`
  const replaceRegex = new RegExp(regexSrc, 'g')

  return replaceRegex.test(string)
    ? string.replace(replaceRegex, m => unescapeMapping[m])
    : string
}

function handleSelect () {
  if (!selection.value) {
    return
  }

  close()

  const ARTISTS_ROLES = ['Art', 'Story&Art', 'Story & Art']
  const AUTHORS_ROLES = ['Story', 'Story&Art', 'Story & Art']

  const STATUS_MAPPING: Record<AL.AnilistStatus, TachiyomiStatus> = {
    CANCELLED: '5',
    FINISHED: '2',
    HIATUS: '6',
    NOT_YET_RELEASED: '0',
    RELEASING: '1'
  }

  const entry: TachiyomiEntry = {
    title: properTitle(selection.value.title),
    author: selection.value.staff.edges
      .filter(edge => AUTHORS_ROLES.includes(edge.role))
      .map(edge => edge.node.name.full)
      .sort()
      .join(', '),
    artist: selection.value.staff.edges
      .filter(edge => ARTISTS_ROLES.includes(edge.role))
      .map(edge => edge.node.name.full)
      .sort()
      .join(', '),
    description: unescapeEntities(
      selection.value.description
        ?.replaceAll('\n', '')
        ?.replaceAll('<br>', '\n')
        ?.replace(/<\/?[^>]+(>|$)/g, '')
        ?.trim()
    ),
    genre: selection.value.genres.join(', '),
    status: STATUS_MAPPING[selection.value.status] || '0'
  }

  emit('select', entry)
}

function properTitle (title: AL.AnilistMedia['title']): string {
  return useEnglishTitle.value ? (title.english ?? title.romaji) : title.romaji
}
</script>

<template>
  <Dialog
    :class="{ hidden: !open }"
    :open="open"
    @close="close"
  >
    <div class="fixed z-30 inset-0 flex flex-col items-center justify-center sm:py-6 sm:px-6 md:px-0 md:py-12 lg:py-16">
      <DialogOverlay
        class="absolute inset-0 bg-gray-900/80 supports-backdrop-blur:bg-gray-900/60 backdrop-blur"
      />

      <div class="relative flex flex-col justify-center w-full max-w-2xl max-h-full overflow-hidden bg-white sm:shadow-xl sm:rounded-2xl ring-1 ring-black/5">
        <header class="shrink-0 py-4 px-6 bg-gray-100 border-b flex justify-between items-center">
          <DialogTitle as="p" class="text-lg font-medium">
            Title search
          </DialogTitle>
          <button class="button-ghost button-rounded -mr-2" title="Close" aria-label="Close" @click="close">
            <XCircleIcon class="w-6 h-6 !ml-0" />
          </button>
        </header>
        <section class="flex-1 min-h-0 overflow-y-auto p-6">
          <div class="relative group w-full">
            <input
              class="!rounded-full text-lg w-full pl-12"
              type="search"
              placeholder="Search using Anilist"
              :disabled="loading"
              v-model="query"
              @keydown.prevent.enter="search"
            >
            <div class="flex items-center justify-center absolute left-0 top-0 h-full aspect-square">
              <MagnifyingGlassIcon class="w-6 h-6 text-gray-400 group-focus-within:text-gray-500" />
            </div>
          </div>

          <RadioGroup v-model="selection" class="pt-6" v-if="results.length > 0">
            <RadioGroupLabel class="sr-only">
              Select the title
            </RadioGroupLabel>
            <div class="space-y-2">
              <RadioGroupOption
                v-for="title of results"
                :key="title.id"
                :value="title"
                class="title-option select-none"
                v-slot="{ checked }"
              >
                <div class="title-cover">
                  <figure class="rounded-md aspect-[2/3] overflow-hidden">
                    <img
                      class="w-full h-full object-cover"
                      :src="title.coverImage.extraLarge"
                      :alt="`Cover of ${properTitle(title.title)}`"
                    >
                  </figure>
                </div>
                <div class="title-data">
                  <p class="title-title">{{ properTitle(title.title) }}</p>
                  <p class="title-authors has-text-grey-dark">{{ authors(title) }}</p>

                  <div class="title-tags">
                    <span :class="tagClass(title.status)" class="tag is-light title-status">
                      {{ statusText(title.status) }}
                    </span>

                    <span class="title-format has-text-grey">
                      {{ formatText(title.format) }}
                    </span>
                  </div>
                </div>
                <div class="title-icon" v-if="checked">
                  <CheckCircleIcon class="title-check-icon" />
                </div>
              </RadioGroupOption>
            </div>
          </RadioGroup>

          <p v-if="searchedOnce && results.length === 0 && !loading">
            No results found for "{{ query }}".
          </p>
        </section>
        <footer class="shrink-0 py-4 px-6 bg-gray-100 border-t flex justify-end sm:justify-between items-center">
          <p class="text-xs hidden md:block text-gray-600">
            Search powered by <a class="text-primary-600 underline" href="https://anilist.co" target="_blank">Anilist.co</a>
          </p>
          <div class="flex gap-2">
            <button @click="close">Cancel</button>
            <button
              class="button-primary"
              :disabled="selection === null"
              @click="handleSelect"
            >
              <CheckIcon class="w-5 h-5" />
              <span>Select</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Dialog>
</template>

<style lang="postcss" scoped>
.title-option {
  @apply p-2 border border-gray-300 rounded-md flex gap-4;

  &[aria-checked='true'],
  &:focus {
    @apply border-primary-600;
  }

  &:focus {
    @apply outline-none ring-2 ring-primary-600/20;
  }

  .title-cover,
  .title-icon {
    @apply shrink-0;
  }

  .title-cover {
    @apply w-16;
  }

  .title-data {
    @apply grow min-w-0 flex flex-col h-full;
  }

  .title-title,
  .title-authors {
    @apply w-full truncate;
  }

  .title-title {
    @apply font-semibold;
  }

  .title-authors {
    @apply text-sm text-gray-700;
  }

  .title-icon {
    @apply w-6 h-6;

    .title-check-icon {
      @apply w-6 h-6 text-primary-600;
    }
  }

  .title-tags {
    @apply mt-6 flex items-center;
  }

  .title-status {
    @apply text-xs font-semibold tracking-wide px-2 py-0.5 rounded;
  }

  .title-format {
    @apply ml-4 text-xs;
  }
}
</style>