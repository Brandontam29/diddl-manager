import { z } from 'zod'

export const libraryEntrySchema = z.object({
  name: z.string(),
  owned: z.boolean(),
  damaged: z.boolean(),
  type: z.string(),
  isCompleteSet: z.boolean(),
  imagePath: z.string()
})

export type LibraryEntry = z.infer<typeof libraryEntrySchema>
