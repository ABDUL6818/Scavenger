import { useMemo } from 'react'
import { type UseFormRegister, type UseFormWatch, type FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { convertWeight, type WeightUnit } from '@/lib/validation/wasteSubmission'
import type { WasteFormValues } from './WasteSubmissionFields'

/**
 * WasteWeightField
 *
 * Numeric weight entry with a unit toggle (grams/kilograms) and a live
 * converted-weight hint. Validation is driven by the zod schema in
 * `@/lib/validation/wasteSubmission` via react-hook-form registration.
 *
 * @example
 * <WasteWeightField
 *   register={register}
 *   watch={watch}
 *   errors={errors}
 *   weightUnit={weightUnit}
 *   setWeightUnit={setWeightUnit}
 * />
 */

interface WasteWeightFieldProps {
  register: UseFormRegister<WasteFormValues>
  watch: UseFormWatch<WasteFormValues>
  errors: FieldErrors<WasteFormValues>
  weightUnit: WeightUnit
  setWeightUnit: (unit: WeightUnit) => void
}

export function WasteWeightField({
  register,
  watch,
  errors,
  weightUnit,
  setWeightUnit,
}: WasteWeightFieldProps) {
  const weightValue = watch('weight')
  const convertedWeight = useMemo(() => convertWeight(weightValue, weightUnit), [weightValue, weightUnit])

  return (
    <section>
      <label htmlFor="weight-input" className="block text-sm font-medium mb-2">
        Weight <span className="text-destructive">*</span>
      </label>
      <div className="flex gap-2">
        <Input
          id="weight-input"
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          placeholder={weightUnit === 'grams' ? 'e.g. 500' : 'e.g. 0.5'}
          aria-invalid={errors.weight ? true : undefined}
          aria-describedby={errors.weight ? 'weight-error' : undefined}
          {...register('weight', { valueAsNumber: true })}
        />
        <button
          type="button"
          onClick={() => setWeightUnit(weightUnit === 'grams' ? 'kilograms' : 'grams')}
          className="shrink-0 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          aria-label={`Switch to ${weightUnit === 'grams' ? 'kilograms' : 'grams'}`}
        >
          {weightUnit === 'grams' ? 'g' : 'kg'}
        </button>
      </div>
      {convertedWeight && (
        <p className="mt-1 text-xs text-muted-foreground">= {convertedWeight}</p>
      )}
      {errors.weight && (
        <p id="weight-error" className="mt-1 text-sm text-destructive" role="alert">
          {errors.weight.message}
        </p>
      )}
    </section>
  )
}
