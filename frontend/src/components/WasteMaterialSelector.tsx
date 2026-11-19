import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import {
  Newspaper, Recycle, Package, Wrench, GlassWater,
  Leaf, Cpu, Search, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WasteType } from '@/api/types'
import { EmptyState } from '@/components/ui/EmptyState'
import type { WasteFormValues } from '@/lib/schemas/waste'

/**
 * Static option metadata. `label` is kept for backwards compatibility with
 * existing callers/tests; UI rendering uses the i18n key `labelKey`.
 */
export const WASTE_TYPE_OPTIONS = [
  { value: WasteType.Paper, label: 'Paper', labelKey: 'waste.materials.paper', icon: Newspaper },
  { value: WasteType.PetPlastic, label: 'PET Plastic', labelKey: 'waste.materials.petPlastic', icon: Recycle },
  { value: WasteType.Plastic, label: 'Plastic', labelKey: 'waste.materials.plastic', icon: Package },
  { value: WasteType.Metal, label: 'Metal', labelKey: 'waste.materials.metal', icon: Wrench },
  { value: WasteType.Glass, label: 'Glass', labelKey: 'waste.materials.glass', icon: GlassWater },
  { value: WasteType.Organic, label: 'Organic', labelKey: 'waste.materials.organic', icon: Leaf },
  { value: WasteType.Electronic, label: 'Electronic', labelKey: 'waste.materials.electronic', icon: Cpu },
] as const

interface WasteMaterialSelectorProps {
  control: Control<WasteFormValues>
  selectedType: WasteType | ''
  errors: FieldErrors<WasteFormValues>
}

export function WasteMaterialSelector({ control, selectedType, errors }: WasteMaterialSelectorProps) {
  const { t } = useTranslation()
  const [materialSearch, setMaterialSearch] = useState('')
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false)

  const filteredMaterials = useMemo(() => {
    if (!materialSearch) return WASTE_TYPE_OPTIONS
    const lower = materialSearch.toLowerCase()
    return WASTE_TYPE_OPTIONS.filter((opt) =>
      t(opt.labelKey).toLowerCase().includes(lower)
    )
  }, [materialSearch, t])

  const selectedOption = WASTE_TYPE_OPTIONS.find((opt) => opt.value === selectedType)

  return (
    <section>
      <label className="block text-sm font-medium mb-2">
        {t('waste.materialType')} <span className="text-destructive">*</span>
      </label>
      <Controller
        name="wasteType"
        control={control}
        render={({ field, fieldState }) => (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMaterialDropdownOpen(!materialDropdownOpen)}
              className={cn(
                'flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                !selectedOption && 'text-muted-foreground',
                fieldState.error && 'border-destructive'
              )}
              aria-label={t('waste.selectMaterialType')}
              aria-expanded={materialDropdownOpen}
              aria-haspopup="listbox"
              aria-invalid={fieldState.invalid}
            >
              <span className="flex items-center gap-2">
                {selectedOption ? (
                  <>
                    <selectedOption.icon className="h-4 w-4" />
                    {t(selectedOption.labelKey)}
                  </>
                ) : (
                  t('waste.selectMaterialType')
                )}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
            {materialDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                <div className="flex items-center border-b px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('waste.searchMaterials')}
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                    className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    aria-label={t('waste.searchMaterials')}
                  />
                </div>
                <ul role="listbox" className="max-h-48 overflow-y-auto p-1">
                  {filteredMaterials.length === 0 ? (
                    <li>
                      <EmptyState
                        title={t('waste.noMaterialsFound')}
                        className="px-3 py-2"
                      />
                    </li>
                  ) : (
                    filteredMaterials.map((opt) => {
                      const Icon = opt.icon
                      return (
                        <li
                          key={opt.value}
                          role="option"
                          aria-selected={field.value === opt.value}
                          onClick={() => {
                            field.onChange(opt.value)
                            field.onBlur()
                            setMaterialDropdownOpen(false)
                            setMaterialSearch('')
                          }}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent',
                            field.value === opt.value && 'bg-accent'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {t(opt.labelKey)}
                        </li>
                      )
                    })
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      />
      {errors.wasteType && (
        <p className="mt-1 text-sm text-destructive" role="alert">{errors.wasteType.message}</p>
      )}
      {!errors.wasteType && selectedType === '' && (
        <p className="mt-1 text-xs text-muted-foreground">Choose the material you are submitting.</p>
      )}
    </section>
  )
}
