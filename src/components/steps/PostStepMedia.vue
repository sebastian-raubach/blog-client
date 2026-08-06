<script setup lang="ts">
import type { LocalImageDetails } from '@/plugins/types/client'
import { coreStore } from '@/stores/app'
import { mdiCamera, mdiNewBox, mdiYoutube } from '@mdi/js'

const photos = defineModel<LocalImageDetails[]>('photos', {
  default: () => [],
})
const videos = defineModel<string[]>('videos', {
  default: () => [],
})

let photoCounter = 1

const store = coreStore()
const newVideo = ref<string>()

// Object URLs for local file previews, cleaned up on unmount.
const objectUrls = new Map<number, string>()

function previewUrl(photo: LocalImageDetails): string {
  if (photo.imagePath) {
    return `${store.storeBaseUrl}image/${photo.imageId}/large/${photo.imagePath}`
  }
  if (!photo.file) {
    return ''
  }
  let url = objectUrls.get(photo.imageId)
  if (!url) {
    url = URL.createObjectURL(photo.file)
    objectUrls.set(photo.imageId, url)
  }
  return url
}

onBeforeUnmount(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url))
  objectUrls.clear()
})

function onFilesSelected(files: File[] | File | null) {
  if (!files) return
  const list = Array.isArray(files) ? files : [files]
  const newPhotos: LocalImageDetails[] = list.map((file) => ({
    imageId: -(photoCounter++),
    file,
    description: '',
    isNew: true,
  }))
  photos.value = [...photos.value, ...newPhotos]
}

function toggleOthers (index: number) {
  if (photos.value[index].isPrimary) {
    photos.value.forEach((image, oi) => {
      if (oi !== index) {
        image.isPrimary = false
      }
    })
  }
}

function removeVideo (index: number) {
  videos.value = videos.value.filter((_, i) => i !== index)
}

function removePhoto (id: number) {
  const url = objectUrls.get(id)
  if (url) {
    URL.revokeObjectURL(url)
    objectUrls.delete(id)
  }
  photos.value = photos.value.filter((p) => p.imageId !== id)
}

function addVideo () {
  if (!newVideo.value || !newVideo.value.trim().length) {
    return
  }
  videos.value = [...videos.value, newVideo.value.trim()]
  newVideo.value = undefined
}

function updateDescription(id: number, description: string) {
  photos.value = photos.value.map((p) => (p.imageId === id ? { ...p, description } : p))
}

function updateVideo(index: number, val: string): void {
  const updated = [...videos.value]
  updated[index] = val
  videos.value = updated
}
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-file-input
      label="Bilder hinzufügen"
      :prepend-inner-icon="mdiCamera"
      prepend-icon=""
      multiple
      accept=".jpg, .jpeg, .png"
      chips
      @update:model-value="onFilesSelected"
    />

    <v-row v-if="photos.length">
      <v-col v-for="(photo, index) in photos" :key="photo.imageId" cols="12" sm="6" md="4">
        <v-card variant="tonal">
          <v-img :src="previewUrl(photo)" height="160" cover />
          <v-card-text class="d-flex flex-column ga-2">
            <v-textarea
              :model-value="photo.description"
              label="Description"
              rows="2"
              hide-details
              auto-grow
              @update:model-value="(v: string) => updateDescription(photo.imageId, v)"
            />
            <v-switch v-model="photo.isPrimary" hide-details color="primary" label="Primärbild?" @update:model-value="toggleOthers(index)" />
            <v-chip v-if="photo.isNew" size="small" color="primary" variant="tonal" class="align-self-start" :prepend-icon="mdiNewBox">Neu</v-chip>
          </v-card-text>
          <v-card-actions v-if="photo.isNew">
            <v-spacer />
            <v-btn variant="text" color="error" @click="removePhoto(photo.imageId)">Entfernen</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-else type="info" variant="tonal" density="compact">Keine Bilder hinzufügt.</v-alert>

    <v-divider class="my=10" />

    <v-text-field
      v-model="newVideo"
      label="Video hinzufügen"
      :prepend-inner-icon="mdiYoutube"
      @keydown.enter.prevent="addVideo"
    />

    <v-row v-if="videos.length">
      <v-col v-for="(_, index) in videos" :key="`video-${index}`" cols="12" sm="6" md="4">
        <v-card variant="tonal">
          <v-img :src="`https://img.youtube.com/vi/${videos[index]}/maxresdefault.jpg`" max-height="250px" aspect-ratio="16/9" cover />
          <v-card-text class="d-flex flex-column ga-2">
            <v-text-field
              :model-value="videos[index]"
              label="Youtube Video ID"
              :prepend-icon="mdiYoutube"
              hide-details
              @update:model-value="updateVideo(index, $event)"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" color="error" @click="removeVideo(index)">Entfernen</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-else type="info" variant="tonal" density="compact">Keine Videos hinzufügt.</v-alert>
  </div>
</template>
