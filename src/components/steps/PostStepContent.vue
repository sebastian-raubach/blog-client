<script setup lang="ts">
defineProps<{
  title: string
  markdown: string
}>()

const title = defineModel<string>('title')
const markdown = defineModel<string>('markdown')
const visible = defineModel<boolean>('visible', {
  default: true,
})

const tab = ref<'write' | 'preview'>('write')
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-text-field
      v-model="title"
      label="Titel"
      persistent-hint
    />

    <v-switch
      v-model="visible"
      label="Sichtbar"
      hide-details
      color="primary"
    />

    <v-tabs v-model="tab" color="primary">
      <v-tab value="write">Schreiben</v-tab>
      <v-tab value="preview">Vorschau</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="write">
        <v-textarea
          v-model="markdown"
          label="Inhalt (Markdown)"
          rows="14"
          auto-grow
        />
      </v-window-item>

      <v-window-item value="preview">
        <v-card variant="tonal" class="pa-4">
          <Markdown :source="markdown" />
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>
