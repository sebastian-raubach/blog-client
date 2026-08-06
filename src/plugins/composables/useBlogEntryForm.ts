import { reactive, ref } from 'vue'
import { PostsType, type BlogEntryFormState, type Hikestats, type ViewPosts } from '@/plugins/types/blog'
import { apiPatchImportPost, apiPatchPostImages, apiPostPostImages, apiPutImportPost } from '@/plugins/api/post'

export interface SubmitResponse {
  successful: boolean,
  postId?: number
}

export function useBlogEntryForm(existingEntry?: ViewPosts | null) {
  const isEditMode = !!existingEntry

  const form = reactive<BlogEntryFormState>({
    id: existingEntry?.postId,
    type: (existingEntry?.postType as PostsType) ?? PostsType.news,
    title: existingEntry?.postTitle ?? '',
    visible: existingEntry?.postVisible ?? true,
    markdown: existingEntry?.postMarkdown ?? '',
    photos: existingEntry?.images.map(p => {
      return {
        imageId: p.imageId,
        imagePath: p.imagePath,
        isPrimary: p.imageIsPrimary === 1,
        description: p.imageDescription,
        isNew: false,
      }
    }) ?? [],
    individuals: existingEntry?.people.map(i => i.personId) ?? [],
    videos: existingEntry?.videos ?? [],
    gpx: undefined,
    ratings: existingEntry?.hikerating ?? { view: 3, path: 3, weather: 3 },
    peaks: existingEntry?.hills.map((p) => ({ ...p })) ?? [],
    start: existingEntry?.postStartDate ?? new Date().toISOString(),
    end: existingEntry?.postEndDate,
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
        await apiPatchImportPost(form.id, {
          title: form.title,
          contentMarkdown: form.markdown,
          visible: form.visible,
          videos: form.videos,
        })

        if (form.photos.length) {
          const newPhotos = form.photos.filter(p => p.isNew)
          const oldPhotos = form.photos.filter(p => !p.isNew)

          if (newPhotos.length) {
            const formData = new FormData()
            for (const photo of newPhotos) {
              if (photo.file) {
                formData.append('image', photo.file)
                formData.append('image-description', photo.description || 'N/A')
                formData.append('image-is-primary', `${photo.isPrimary || false}`)
              }
            }
            await apiPostPostImages(form.id, formData)
          }

          if (oldPhotos.length) {
            await apiPatchPostImages(form.id, oldPhotos)
          }
        }
      } else {
        const stats: Hikestats | undefined = form.gpx?.stats ? {
          distance: form.gpx.stats.distanceKm,
          ascent: form.gpx.stats.elevationGainM,
          duration: form.gpx.stats.durationMinutes,
        } : undefined

        const { data } = await apiPutImportPost({
          type: form.type,
          title: form.title,
          contentMarkdown: form.markdown,
          visible: form.visible,
          createdOn: form.start,
          endDate: form.end,
          individuals: form.individuals,
          // TODO: Other fields
          hills: form.peaks.map(p => {
            if ((p?.hillId || 1) < 0) {
              delete p.hillId
            }
            return p
          }),
          rating: form.ratings,
          stats,
          videos: form.videos,
        })
        form.id = data

        if (form.photos.length) {
          const formData = new FormData()
          for (const photo of form.photos) {
            if (photo.file) {
              formData.append('image', photo.file)
              formData.append('image-description', photo.description || 'N/A')
              formData.append('image-is-primary', `${photo.isPrimary || false}`)
            }
          }

          if (form.type === 'hike' && form.gpx?.minifiedFile) {
            formData.append('gpx', form.gpx.minifiedFile)
          }

          await apiPostPostImages(form.id, formData)
        }
      }

      return {
        successful: true,
        postId: form.id,
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
