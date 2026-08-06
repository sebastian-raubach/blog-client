<template>
  <v-card>
    <v-responsive :aspect-ratio="16 / 9">
      <iframe
        :src="`https://www.youtube.com/embed/${video}`"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="w-100 h-100"
      ></iframe>
    </v-responsive>
  </v-card>
</template>

<script setup lang="ts">
  defineProps<{
    video: string
  }>()
</script>