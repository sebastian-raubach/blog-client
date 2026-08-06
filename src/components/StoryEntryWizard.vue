<template>
  <v-card>
    <v-card-title>{{ isEditMode ? 'Story bearbeiten' : 'Neue Story' }}</v-card-title>

    <v-stepper v-model="currentStep" hide-actions>
      <v-stepper-header>
        <template v-for="(step, i) in steps" :key="step.value">
          <v-stepper-item :value="step.value" :title="step.title" :complete="currentStepIndex > i" :icon="step.icon" />
          <v-divider v-if="i < steps.length - 1" />
        </template>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item value="type">
          <StoryStepEntryType
            v-model:start="form.start"
          />
        </v-stepper-window-item>

        <v-stepper-window-item value="content">
          <StoryStepContent
            v-model:title="form.title"
            v-model:markdown="form.markdown"
            :title-editable="!isEditMode"
          />
        </v-stepper-window-item>

        <v-stepper-window-item value="posts">
          <StoryStepPosts
            v-model:posts="form.posts"
          />
        </v-stepper-window-item>

        <v-stepper-window-item value="review">
          <StoryStepReview :form="form" />
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
import type { ViewStories } from '@/plugins/types/blog'
import { mdiCardText, mdiEyeCheck, mdiNotebookMultiple, mdiCalendarRange } from '@mdi/js'

import emitter from 'tiny-emitter/instance'
import { coreStore } from '@/stores/app'
import { useStoryEntryForm } from '@/plugins/composables/useStoryEntryForm'

const router = useRouter()

const props = defineProps<{
  /** Pass an existing entry to open the wizard in edit mode (markdown, photo descriptions, new photos only). */
  existingEntry?: ViewStories | null
}>()

const emit = defineEmits<{
  saved: [id: number | undefined]
  cancel: []
}>()

const store = coreStore()

const { form, isEditMode, submitting, submitError, submit } = useStoryEntryForm(props.existingEntry)

const setupCompleted = ref(false)

interface StepDef {
  value: string
  title: string
  icon: string
}

const steps = computed<StepDef[]>(() => {
  return [
    { value: 'type', title: 'Daten', icon: mdiCalendarRange, },
    { value: 'content', title: 'Inhalt', icon: mdiCardText },
    { value: 'posts', title: 'Berichte', icon: mdiNotebookMultiple },
    { value: 'review', title: 'Vorschau', icon: mdiEyeCheck },
  ]
})

const currentStep = ref(steps.value[0].value)

const currentStepIndex = computed(() => steps.value.findIndex((s) => s.value === currentStep.value))
const isFirstStep = computed(() => currentStepIndex.value <= 0)
const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1)

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 'type':
      return !!form.start
    case 'content':
      return form.markdown.trim().length > 0 && (isEditMode || form.title.trim().length > 0)
    case 'posts':
      return form.posts.length > 0
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
    title: 'Story-Editor verlassen',
    message: 'Sicher, dass der Story-Editor verlassen werden soll? Alle Änderungen gehen verloren.',
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
  const { successful, storyId } = await submit()
  if (successful) {
    router.push(`/story/${storyId}`)
  }
}
</script>
