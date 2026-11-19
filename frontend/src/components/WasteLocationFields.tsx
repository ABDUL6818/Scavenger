import { useId, useState } from 'react'
import { type UseFormRegister, type UseFormSetValue, type FieldErrors } from 'react-hook-form'
import { LocateFixed } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import type { WasteFormValues } from './WasteSubmissionFields'

// Coordinates are validated by the shared zod schema (see wasteFormSchema);
// this component only renders the fields and surfaces schema-derived messages.

interface WasteLocationFieldsProps {
  register: UseFormRegister<WasteFormValues>
  setValue: UseFormSetValue<WasteFormValues>
  errors: FieldErrors<WasteFormValues>
}

export function WasteLocationFields({ register, setValue, errors }: WasteLocationFieldsProps) {
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)
  const groupLabelId = useId()
  const latitudeErrorId = useId()
  const longitudeErrorId = useId()

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.')
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
        setLocError('Could not get location. Enter coordinates manually.')
        setLocating(false)
      },
      { timeout: 8000 }
    )
  }

  return (
    <section role="group" aria-labelledby={groupLabelId}>
      <span id={groupLabelId} className="block text-sm font-medium mb-2">
        Location <span className="text-destructive" aria-hidden="true">*</span>
        <span className="sr-only">(required)</span>
      </span>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            step="0.000001"
            placeholder="Latitude"
            aria-label="Latitude"
            aria-describedby={errors.latitude ? latitudeErrorId : undefined}
            aria-invalid={errors.latitude ? true : undefined}
            {...register('latitude')}
          />
          {errors.latitude && (
            <p id={latitudeErrorId} className="mt-1 text-sm text-destructive" role="alert">{errors.latitude.message}</p>
          )}
        </div>
        <div>
          <Input
            type="number"
            step="0.000001"
            placeholder="Longitude"
            aria-label="Longitude"
            aria-describedby={errors.longitude ? longitudeErrorId : undefined}
            aria-invalid={errors.longitude ? true : undefined}
            {...register('longitude')}
          />
          {errors.longitude && (
            <p id={longitudeErrorId} className="mt-1 text-sm text-destructive" role="alert">{errors.longitude.message}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        aria-busy={locating}
        className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <LocateFixed className={cn('h-4 w-4', locating && 'animate-pulse')} aria-hidden="true" />
        {locating ? 'Locating...' : 'Use current location'}
      </button>
      {locError && (
        <p className="mt-1 text-sm text-destructive" role="alert" aria-live="assertive">{locError}</p>
      )}
    </section>
  )
}
