import { useState } from 'react'
import { type UseFormRegister, type UseFormSetValue, type FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LocateFixed } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import type { WasteFormValues } from './WasteSubmissionFields'

// Coordinates are validated by the shared zod schema (see wasteFormSchema);
// this component only renders the fields and surfaces schema-derived messages.

interface WasteLocationFieldsProps {
  register: UseFormRegister<WasteFormValues>
  setValue: UseFormSetValue<WasteFormValues>
  errors: FieldErrors<WasteFormValues>
}

export function WasteLocationFields({ register, setValue, errors }: WasteLocationFieldsProps) {
  const { t } = useTranslation()
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError(t('waste.location.geolocationUnsupported'))
      return
    }
    setLocating(true)
    setLocError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude.toFixed(6), { shouldValidate: true })
        setValue('longitude', pos.coords.longitude.toFixed(6), { shouldValidate: true })
        setLocating(false)
      },
      () => {
        setLocError(t('waste.location.geolocationFailed'))
        setLocating(false)
      },
      { timeout: 8000 }
    )
  }

  return (
    <section>
      <label className="block text-sm font-medium mb-2">
        {t('waste.location.label')} <span className="text-destructive">*</span>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            step="0.000001"
            placeholder={t('waste.location.latitude')}
            aria-label={t('waste.location.latitude')}
            aria-invalid={errors.latitude ? true : undefined}
            {...register('latitude')}
          />
          {errors.latitude && (
            <p className="mt-1 text-sm text-destructive" role="alert">{errors.latitude.message}</p>
          )}
        </div>
        <div>
          <Input
            type="number"
            step="0.000001"
            placeholder={t('waste.location.longitude')}
            aria-label={t('waste.location.longitude')}
            aria-invalid={errors.longitude ? true : undefined}
            {...register('longitude')}
          />
          {errors.longitude && (
            <p className="mt-1 text-sm text-destructive" role="alert">{errors.longitude.message}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <LocateFixed className={cn('h-4 w-4', locating && 'animate-pulse')} />
        {locating ? t('waste.location.locating') : t('waste.location.useCurrentLocation')}
      </button>
      {locating && (
        <LoadingState
          label={t('waste.location.locating')}
          className="mt-2"
        />
      )}
      {locError && (
        <p className="mt-1 text-sm text-destructive" role="alert">{locError}</p>
      )}
    </section>
  )
}
