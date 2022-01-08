<script setup>
import LocalForm from './components/LocalForm.vue'
</script>

<template>
  <div class="container is-max-desktop pt-3">
    <section class="section has-text-centered is-flex is-flex-direction-column is-align-items-center">
      <figure class="image is-64x64">
        <img src="https://tachiyomi.org/icons/logo.svg" alt="Tachiyomi Logo">
      </figure>
      <h1 class="title has-text-weight-bold mt-5">Tachiyomi Local Source JSON Generator</h1>
      <p class="subtitle">
        A tool that helps you to easily create the JSON file with metadata.
      </p>
    </section>
    <LocalForm />

    <footer class="p-6">
      <div class="content is-small has-text-centered">
        <p>
          Created by <a href="https://github.com/alessandrojean" target="_blank">Alessandro Jean</a>.
          Source code available on <a href="https://github.com/alessandrojean/tachi-local" target="_blank">GitHub</a>.
        </p>
      </div>
    </footer>
  </div>
</template>
