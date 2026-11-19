import { useId } from 'react'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { UploadImage } from '@/hooks/useImageUpload'

export interface WasteSubmissionImageUploadProps {
  images: UploadImage[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  validationError?: string | null
  photoError?: string | null
}

export function WasteSubmissionImageUpload({
  images,
  onAdd,
  onRemove,
  validationError,
  photoError,
}: WasteSubmissionImageUploadProps) {
  const labelId = useId()
  const errorId = useId()

  return (
    <section
      role="group"
      aria-labelledby={labelId}
      aria-required="true"
      aria-describedby={photoError ? errorId : undefined}
    >
      <span id={labelId} className="block text-sm font-medium mb-2">
        Photos <span className="text-destructive" aria-hidden="true">*</span>
        <span className="sr-only"> (required)</span>
      </span>
      <ImageUpload
        images={images}
        onAdd={onAdd}
        onRemove={onRemove}
        validationError={validationError}
      />
      {photoError && (
        <p
          id={errorId}
          className="mt-1 text-sm text-destructive"
          role="alert"
          aria-live="assertive"
        >
          {photoError}
        </p>
      )}
    </section>
  )
}