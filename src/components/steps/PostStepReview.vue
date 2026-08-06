<script setup lang="ts">
import { postTypeConfigs } from '@/plugins/constants';
import type { BlogEntryFormState } from '@/plugins/types/blog'

defineProps<{ form: BlogEntryFormState }>()
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <div>
      <div class="text-caption text-medium-emphasis">Typ</div>
      <v-chip color="primary" variant="tonal" :text="postTypeConfigs[form.type].title" :prepend-icon="postTypeConfigs[form.type].icon" />
    </div>

    <div>
      <div class="text-caption text-medium-emphasis mb-1">Title</div>
      <div class="text-h6">{{ form.title || '(untitled)' }}</div>
    </div>

    <div>
      <div class="text-caption text-medium-emphasis mb-1">Content preview</div>
      <v-card variant="outlined" class="pa-4">
        <Markdown :source="form.markdown" />
      </v-card>
    </div>

    <div v-if="form.photos.length">
      <div class="text-caption text-medium-emphasis mb-1">Fotos <v-chip size="small" :text="form.photos.length" /></div>
      <v-chip-group column>
        <v-chip v-for="p in form.photos" :key="p.imageId" size="small">
          {{ p.description || 'Keine Beschreibung' }}
        </v-chip>
      </v-chip-group>
    </div>

    <div v-if="form.videos?.length">
      <div class="text-caption text-medium-emphasis mb-1">Videos <v-chip size="small" :text="form.videos.length" /></div>
      <v-chip-group column>
        <v-chip v-for="p in form.videos" :key="p" size="small">
          {{ p || 'Keine ID' }}
        </v-chip>
      </v-chip-group>
    </div>

    <div v-if="form.gpx">
      <div class="text-caption text-medium-emphasis mb-1">Track</div>
      <div>
        {{ form.gpx.stats.distanceKm }} km · {{ form.gpx.stats.elevationGainM }} m gain ·
        {{ form.gpx.stats.durationMinutes }} min
      </div>
    </div>

    <div v-if="form.peaks.length">
      <div class="text-caption text-medium-emphasis mb-1">Peaks <v-chip size="small" :text="form.peaks.length" /></div>
      <v-chip-group column>
        <v-chip v-for="p in form.peaks" :key="p.hillId" size="small"> {{ p.hillName }} · {{ p.hillElevation }} m </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>
