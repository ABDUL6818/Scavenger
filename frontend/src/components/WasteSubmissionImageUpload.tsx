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
  return (
    <section className="w-full min-w-0">
      <label className="mb-2 block text-xs font-medium xs:text-sm tablet:text-sm">
        Photos <span className="text-destructive">*</span>
      </label>
      <ImageUpload
        images={images}
        onAdd={onAdd}
        onRemove={onRemove}
        validationError={validationError}
      />
      {photoError && (
        <p
          className="mt-1 break-words text-xs text-destructive xs:text-sm tablet:text-sm"
          role="alert"
        >
          {photoError}
        </p>
      )}
    </section>
  )
}