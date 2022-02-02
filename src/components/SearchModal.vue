<script setup>
import { computed, ref, toRefs, watch } from 'vue'

import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  RadioGroup,
  RadioGroupLabel,
  RadioGroupOption
} from '@headlessui/vue'
import { CheckCircleIcon, CheckIcon, SearchIcon } from '@heroicons/vue/solid'

const props = defineProps({ 
  open: Boolean,
  searchTerm: String
})

const { open } = toRefs(props)

const emit = defineEmits(['close', 'select'])

function close () {
  emit('close')
}

const query = ref(props.searchTerm)
const error = ref(null)
const loading = ref(false)
const results = ref([])
const selection = ref(null)
const searchedOnce = ref(false)

watch(open, newValue => {
  if (newValue) {
    query.value = props.searchTerm
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
  selection.value = null
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
          title { romaji }
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

    const result = await response.json()

    results.value = result.data.Page.media || []

    if (results.value.length === 1) {
      selection.value = results.value[0]
    }

    searchedOnce.value = true
  } catch (e) {
    error.value = e.message || e
  } finally {
    loading.value = false
  }
}

const ALLOWED_ROLES = ['Art', 'Story', 'Story&Art', 'Story & Art']

function authors (title) {
  const authorsText = title.staff.edges
    .filter(edge => ALLOWED_ROLES.includes(edge.role))
    .map(edge => edge.node.name.full)
    .sort()
    .join(', ')

  return authorsText.length > 0 ? authorsText : 'Unknown authors'
}

function tagClass (status) {
  const mapping = {
    FINISHED: 'is-success',
    RELEASING: 'is-link',
  }

  return mapping[status] || 'is-danger'
}

function statusText (status) {
  const mapping = {
    FINISHED: 'COMPLETED',
    RELEASING: 'ONGOING'
  }

  return mapping[status] || 'UNKNOWN'
}

function formatText (format) {
  const mapping = {
    MANGA: 'Manga',
    NOVEL: 'Novel',
    ONE_SHOT: 'One-shot'
  }

  return mapping[format] || 'Unknown format'
}

function unescapeEntities (string) {
  const unescapeMapping = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': '\'',
    '&#x60;': '`'
  }

  console.log(string)

  const regexSrc = `(?:${Object.keys(unescapeMapping).join('|')})`
  const replaceRegex = new RegExp(regexSrc, 'g')

  return replaceRegex.test(string)
    ? string.replace(replaceRegex, m => unescapeMapping[m])
    : string
}

function handleSelect () {
  close()

  const ARTISTS_ROLES = ['Art', 'Story&Art', 'Story & Art']
  const AUTHORS_ROLES = ['Story', 'Story&Art', 'Story & Art']

  const STATUS_MAPPING = {
    CANCELLED: '5',
    FINISHED: '2',
    HIATUS: '6',
    RELEASING: '1'
  }

  const entry = {
    title: selection.value.title.romaji,
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
        .replaceAll('\n', '')
        .replaceAll('<br>', '\n')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim()
    ),
    genre: selection.value.genres.join(', '),
    status: STATUS_MAPPING[selection.value.status] || '0'
  }

  emit('select', entry)
}
</script>

<template>
  <Dialog
    :class="['modal', open ? 'is-active' : '']"
    :open="open"
    @close="close"
  >
    <DialogOverlay class="modal-background" />
    <div class="modal-card">
      <header class="modal-card-head">
        <DialogTitle as="p" class="modal-card-title">Title search</DialogTitle>
        <button class="delete" aria-label="Close" @click="close"></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <p
            :class="loading ? 'is-loading' : ''"
            class="control has-icons-left is-medium"
          >
            <input
              class="input is-medium is-rounded"
              type="search"
              placeholder="Search using Anilist"
              :disabled="loading"
              v-model="query"
              @keydown.prevent.enter="search"
            >
            <span class="icon is-left">
              <SearchIcon class="hero-icon" />
            </span>
          </p>
        </div>

        <RadioGroup v-model="selection" class="pt-3" v-if="results.length > 0">
          <RadioGroupLabel class="is-sr-only">
            Select the title
          </RadioGroupLabel>
          <RadioGroupOption
            v-for="title of results"
            :key="title.id"
            :value="title"
            class="title-option"
            v-slot="{ checked }"
          >
            <div class="title-cover">
              <figure class="image is-2by3">
                <img :src="title.coverImage.extraLarge" :alt="title.title.romaji">
              </figure>
            </div>
            <div class="title-data">
              <p class="title-title">{{ title.title.romaji }}</p>
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
        </RadioGroup>

        <p v-if="searchedOnce && results.length === 0 && !loading">
          No results found for "{{ query }}".
        </p>
      </section>
      <footer class="modal-card-foot is-justify-content-space-between">
        <p class="is-size-7 is-hidden-touch">
          Search powered by <a href="https://anilist.co" target="_blank">Anilist.co</a>
        </p>
        <div>
          <button class="button" @click="close">Cancel</button>
          <button
            class="button is-link"
            :disabled="selection === null"
            @click="handleSelect"
          >
            <span class="icon" aria-hidden="true">
              <CheckIcon class="hero-icon" />
            </span>
            <span>Select</span>
          </button>
        </div>
      </footer>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
.title-option {
  padding: 0.5em;
  border: 1px solid #dadada;
  border-radius: 5px;
  display: flex;

  &[aria-checked='true'],
  &:focus {
    border-color: hsl(229, 53%,  53%);
  }

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 0.125em rgba(72, 95, 199, 0.25);
  }

  &:not(:last-child) {
    margin-bottom: 0.5em;
  }

  .title-cover,
  .title-icon {
    flex-shrink: 0;
  }

  .title-cover {
    width: 4em;
    margin-right: 1em;
  }

  .title-data {
    min-width: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .title-title,
  .title-authors {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .title-title {
    font-weight: bold;
  }

  .title-authors {
    font-size: 0.9em;
  }

  .title-icon {
    width: 1.5em;

    .title-check-icon {
      width: 1.5em;
      height: 1.5em;
      fill: hsl(229, 53%,  53%);
    }
  }

  .title-tags {
    margin-top: 1.5em;
    display: flex;
    align-content: center;
  }

  .title-status {
    letter-spacing: 0.025em;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 600;
  }

  .title-format {
    margin-left: 1em;
    font-size: 0.75rem;
    line-height: 1.5rem;
  }
}
</style>