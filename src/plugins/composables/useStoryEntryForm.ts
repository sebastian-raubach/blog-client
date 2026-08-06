import { reactive, ref } from 'vue'
import { type StoryEntryFormState, type ViewStories } from '@/plugins/types/blog'
import { apiPatchStory, apiPutStory } from '@/plugins/api/story'

export interface SubmitResponse {
  successful: boolean,
  storyId?: number
}

export function useStoryEntryForm(existingEntry?: ViewStories | null) {
  const isEditMode = !!existingEntry

  const form = reactive<StoryEntryFormState>({
    id: existingEntry?.storyId,
    title: existingEntry?.storyTitle ?? '',
    markdown: existingEntry?.storyMarkdown ?? '',
    posts: existingEntry?.posts.map(p => {
      return {
        id: p.id,
        title: p.title,
        type: p.type,
      }
    }) ?? [],
    start: existingEntry?.storyStartDate ?? new Date().toISOString(),
  })

  const submitting = ref(false)
  const submitError = ref<string | null>(null)

  /**
   * Runs the appropriate sequence of API calls for create vs. edit mode.
   * Returns true on success so the caller can close the wizard / show a toast / etc.
   */
  async function submit(): Promise<SubmitResponse> {
    submitting.value = true
    submitError.value = null

    try {
      if (isEditMode && form.id) {
        await apiPatchStory(form.id, {
          storyTitle: form.title,
          storyMarkdown: form.markdown,
          storyContent: undefined,
          storyStartDate: form.start || new Date().toISOString(),
          posts: form.posts,
        })
      } else {
        const { data } = await apiPutStory({
          storyTitle: form.title,
          storyMarkdown: form.markdown,
          storyContent: undefined,
          storyStartDate: form.start || new Date().toISOString(),
          posts: form.posts,
        })
        form.id = data
      }

      return {
        successful: true,
        storyId: form.id,
      }
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Something went wrong while saving.'
      return {
        successful: false,
      }
    } finally {
      submitting.value = false
    }
  }

  return { form, isEditMode, submitting, submitError, submit }
}
