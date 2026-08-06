import type { ImageDetails, MiniPost } from '@/plugins/types/blog'

export interface LocalImageDetails extends ImageDetails {
  file?: File
  isNew: boolean
}

export interface LocalMiniPost extends MiniPost {
  isNew?: boolean
}