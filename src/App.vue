<script setup>
import LocalForm from './components/LocalForm.vue'
</script>

<template>
  <div class="container is-max-desktop pt-6">
    <section class="section has-text-centered">
      <h1 class="title has-text-weight-bold">Tachiyomi Local Source JSON Generator</h1>
      <p class="subtitle">
        A tool that helps you to easily create the JSON file with metadata.
      </p>
    </section>
    <LocalForm />

    <footer>
      <div class="content is-small has-text-centered">
        <p>
          Created by <a href="https://github.com/alessandrojean" target="_blank">Alessandro Jean</a>.
          Source code available on <a href="https://github.com/alessandrojean/tachi-local" target="_blank">GitHub</a>.
        </p>
      </div>
    </footer>
  </div>
</template>
