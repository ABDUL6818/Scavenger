import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { WasteType } from '@/api/types'
import { useImageUpload } from '@/hooks/useImageUpload'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { wasteSubmissionSchema, toWeightInGrams, type WeightUnit } from '@/lib/validation/wasteSubmission'
import { STATUSES, type Status } from '@/lib/constants'
import { getSubmitErrorMessage, getPhotoError } from '@/lib/format'
import { WasteSubmissionFields, type WasteFormValues } from './WasteSubmissionFields'
import { WasteSubmissionImageUpload } from './WasteSubmissionImageUpload'
import { WasteSubmissionSummary } from './WasteSubmissionSummary'
import { useToast } from '@/components/ui/Toast'

export { WasteSubmissionFields } from './WasteSubmissionFields'
export { WasteSubmissionImageUpload } from './WasteSubmissionImageUpload'
export { WasteSubmissionSummary } from './WasteSubmissionSummary'

/**
 * Shape of the data emitted by {@link WasteSubmissionForm} on submit.
 *
 * Backwards-compatibility note: this interface is unchanged from the previous
 * hand-rolled implementation. `weight` remains normalized to grams (a number)
 * and `latitude`/`longitude` remain strings, so existing consumers do not need
 * to change. Validation is now driven by the shared `wasteSubmissionSchema`
 * (react-hook-form + zod) rather than ad-hoc checks.
 */
export interface WasteSubmissionFormData {
  wasteType: WasteType
  weight: number
  latitude: string
  longitude: string
  notes: string
  photoCids: string[]
}

interface WasteSubmissionFormProps {
  onSubmit: (data: WasteSubmissionFormData) => Promise<void>
  onCancel: () => void
}

export function WasteSubmissionForm({ onSubmit, onCancel }: WasteSubmissionFormProps) {
  const { t } = useTranslation()
  const { images, addImages, removeImage, uploadIds, isUploading, validationError: imageValidationError } = useImageUpload()
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('grams')
  const [submitState, setSubmitState] = useState<Status>(STATUSES.IDLE)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { toast } = useToast()

  const schema = useMemo(() => wasteSubmissionSchema(weightUnit), [weightUnit])

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<WasteFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { wasteType: '', weight: '', latitude: '', longitude: '', notes: '' },
  })

  const onFormSubmit = handleSubmit(async (data) => {
    if (uploadIds.length === 0) return
    const weightInGrams = toWeightInGrams(data.weight, weightUnit)
    setSubmitState(STATUSES.LOADING)
    setSubmitError(null)

    try {
      await onSubmit({
        wasteType: data.wasteType as WasteType,
        weight: weightInGrams,
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes,
        photoCids: uploadIds,
      })
      setSubmitState(STATUSES.SUCCESS)
    } catch (e) {
      const message = getSubmitErrorMessage(e)
      setSubmitError(message)
      setSubmitState(STATUSES.ERROR)
      toast({ title: 'Submission failed', description: message, variant: 'destructive' })
    }
  })

  const photoError = getPhotoError({
    submitState,
    hasFieldErrors: Object.keys(errors).length > 0,
    uploadCount: uploadIds.length,
    imageCount: images.length,
  })

  if (submitState === STATUSES.SUCCESS) {
    return <WasteSubmissionSummary onDone={onCancel} />
  }

  return (
    <form onSubmit={onFormSubmit} noValidate aria-label="Submit waste" aria-busy={submitState === 'loading'}>
      <Card>
        <CardHeader>
          <CardTitle id="waste-submission-title">{t('wasteSubmission.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <WasteSubmissionFields
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
            weightUnit={weightUnit}
            setWeightUnit={setWeightUnit}
          />
          <WasteSubmissionImageUpload
            images={images}
            onAdd={addImages}
            onRemove={removeImage}
            validationError={imageValidationError}
            photoError={photoError}
          />
          {submitError && (
            <p className="text-sm text-destructive" role="alert" aria-live="assertive">{submitError}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={submitState === STATUSES.LOADING || isUploading}>
              {submitState === STATUSES.LOADING ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
              ) : isUploading ? (
                <LoadingState variant="inline" label={t('wasteSubmission.actions.uploadingPhotos')} />
              ) : (
                t('wasteSubmission.actions.submit')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
