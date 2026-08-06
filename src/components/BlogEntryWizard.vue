<template>
  <v-card>
    <v-card-title>{{ isEditMode ? 'Bericht bearbeiten' : 'Neuer Bericht' }}</v-card-title>

    <v-stepper v-model="currentStep" hide-actions>
      <v-stepper-header>
        <template v-for="(step, i) in steps" :key="step.value">
          <v-stepper-item :value="step.value" :title="step.title" :complete="currentStepIndex > i" :icon="step.icon" />
          <v-divider v-if="i < steps.length - 1" />
        </template>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item value="type">
          <PostStepEntryType
            v-model:type="form.type"
            v-model:start="form.start"
            v-model:end="form.end"
            v-model:individuals="form.individuals"
          />
        </v-stepper-window-item>

        <v-stepper-window-item value="content">
          <PostStepContent
            v-model:title="form.title"
            v-model:markdown="form.markdown"
            v-model:visible="form.visible"
            :title-editable="!isEditMode"
          />
        </v-stepper-window-item>

        <v-stepper-window-item value="media">
          <PostStepMedia
            v-model:photos="form.photos"
            v-model:videos="form.videos"
          />
        </v-stepper-window-item>

        <v-stepper-window-item value="gpx">
          <PostStepGpx v-model="form.gpx" />
        </v-stepper-window-item>

        <v-stepper-window-item value="peaks">
          <PostStepPeaks v-model:hills="form.peaks" v-model:ratings="form.ratings" ref="peaksStep" />
        </v-stepper-window-item>

        <v-stepper-window-item value="review">
          <PostStepReview :form="form" />
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>

    <v-alert v-if="submitError" type="error" variant="tonal" class="mx-4 mb-2">{{ submitError }}</v-alert>

    <v-card-actions>
      <v-btn variant="text" @click="checkConfirm">Abbrechen</v-btn>
      <v-spacer />
      <v-btn v-if="!isFirstStep" variant="text" @click="goPrev">Zurück</v-btn>
      <v-btn v-if="!isLastStep" color="primary" :disabled="!canProceed" @click="goNext">Weiter</v-btn>
      <v-btn v-else color="primary" :loading="submitting" @click="handleSubmit">
        {{ isEditMode ? 'Änderungen speichern' : 'Veröffentlichen' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBlogEntryForm } from '@/plugins/composables/useBlogEntryForm'
import type { ViewPosts } from '@/plugins/types/blog'
import { mdiCardText, mdiEyeCheck, mdiImageFilterHdr, mdiMultimedia, mdiMapMarkerPath, mdiTune } from '@mdi/js'

import emitter from 'tiny-emitter/instance'
import { coreStore } from '@/stores/app'

const router = useRouter()

const props = defineProps<{
  /** Pass an existing entry to open the wizard in edit mode (markdown, photo descriptions, new photos only). */
  existingEntry?: ViewPosts | null
}>()

const emit = defineEmits<{
  saved: [id: number | undefined]
  cancel: []
}>()

const store = coreStore()
const peaksStep = useTemplateRef('peaksStep')

const { form, isEditMode, submitting, submitError, submit } = useBlogEntryForm(props.existingEntry)

const setupCompleted = ref(false)

interface StepDef {
  value: string
  title: string
  icon: string
}

const steps = computed<StepDef[]>(() => {
  if (isEditMode) {
    return [
      { value: 'content', title: 'Inhalt', icon: mdiCardText },
      { value: 'media', title: 'Medien', icon: mdiMultimedia },
      { value: 'review', title: 'Vorschau', icon: mdiEyeCheck },
    ]
  }

  const list: StepDef[] = [
    { value: 'type', title: 'Typ', icon: mdiTune, },
    { value: 'content', title: 'Inhalt', icon: mdiCardText },
    { value: 'media', title: 'Medien', icon: mdiMultimedia },
    { value: 'gpx', title: 'Strecke', icon: mdiMapMarkerPath },
  ]
  if (form.type === 'hike') {
    list.push({ value: 'peaks', title: 'Hügel', icon: mdiImageFilterHdr, })
  }
  list.push({ value: 'review', title: 'Vorschau', icon: mdiEyeCheck, })
  return list
})

const currentStep = ref(steps.value[0].value)

watch(currentStep, async newValue => {
  if (newValue === 'peaks') {
    nextTick(() => peaksStep.value?.invalidateMap())
  }
})

// If entry type changes (dropping the gpx/peaks steps) and the user was on one of them, bounce back to content.
watch(steps, (newSteps) => {
  if (!newSteps.some((s) => s.value === currentStep.value)) {
    currentStep.value = newSteps[0].value
  }
})

const currentStepIndex = computed(() => steps.value.findIndex((s) => s.value === currentStep.value))
const isFirstStep = computed(() => currentStepIndex.value <= 0)
const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1)

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 'type':
      return !!form.type
    case 'content':
      return form.markdown.trim().length > 0 && (isEditMode || form.title.trim().length > 0)
    default:
      return true
  }
})

function goNext() {
  if (!canProceed.value) return
  const idx = currentStepIndex.value
  if (idx < steps.value.length - 1) currentStep.value = steps.value[idx + 1].value
}

function goPrev() {
  const idx = currentStepIndex.value
  if (idx > 0) currentStep.value = steps.value[idx - 1].value
}

function checkConfirm (callback?: () => void) {
  emitter.emit('show-confirm', {
    title: 'Bericht-Editor verlassen',
    message: 'Sicher, dass der Bericht-Editor verlassen werden soll? Alle Änderungen gehen verloren.',
    okTitle: 'Ja',
    cancelTitle: 'Nein',
    okVariant: 'error',
    callback: (result: boolean) => {
      if (result === true) {
        if (callback) {
          callback()
        } else {
          router.push('/')
        }
      }
    },
  })
}

onBeforeRouteLeave((to, from, next) => {
  if (!setupCompleted.value) {
    checkConfirm(next)
  } else {
    next()
  }
})

onMounted (() => {
  if (!store.token || !store.token.token) {
    setupCompleted.value = true
    router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`)
  }
})

async function handleSubmit() {
  setupCompleted.value = true
  const { successful, postId } = await submit()
  if (successful) {
    router.push(`/post/${postId}`)
  }
}
</script>
