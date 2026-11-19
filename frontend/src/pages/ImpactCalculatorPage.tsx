import { useState } from 'react'
import { useAppTitle } from '@/hooks/useAppTitle'
import { useImpactCalculator } from '@/hooks/useImpactCalculator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Leaf, Zap, Droplets, Trees, Car, Smartphone, ShowerHead, Lightbulb, Share2, Check } from 'lucide-react'

// ── Impact metric card ────────────────────────────────────────────────────────

function ImpactCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  unit: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 px-2 py-4 text-center xs:px-4 xs:py-6">
        <div className={`rounded-full p-2 xs:p-3 ${color}`}>{icon}</div>
        <p className="text-2xl font-bold xs:text-3xl">{value.toLocaleString()}</p>
        <p className="text-xs font-medium xs:text-sm">{unit}</p>
        <p className="text-[0.6875rem] text-muted-foreground xs:text-xs">{label}</p>
      </CardContent>
    </Card>
  )
}

// ── Equivalent row ────────────────────────────────────────────────────────────

function EquivalentRow({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2 xs:gap-3 xs:px-4 xs:py-3">
      <div className="shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <span className="font-semibold">{value.toLocaleString()}</span>{' '}
        <span className="text-xs text-muted-foreground xs:text-sm">{label}</span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ImpactCalculatorPage() {
  useAppTitle('Environmental Impact')
  const { impact, equivalents, shareText, isLoading, isError } = useImpactCalculator()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: shareText }).catch(() => null)
    } else {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted xs:h-40" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-destructive">Failed to load waste data.</p>
  }

  return (
    <div className="space-y-4 px-3 py-4 xs:space-y-6 xs:px-4 xs:py-6 sm:px-0 sm:py-0">
      <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-bold xs:text-xl sm:text-2xl">Environmental Impact</h1>
          <p className="text-xs text-muted-foreground xs:text-sm">
            The positive impact of your recycling activities
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleShare} className="self-start xs:self-auto">
          {copied ? (
            <><Check className="mr-1 h-4 w-4 text-success" /> Copied</>
          ) : (
            <><Share2 className="mr-1 h-4 w-4" /> Share</>
          )}
        </Button>
      </div>

      {/* Main impact metrics */}
      <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:grid-cols-4">
        <ImpactCard
          icon={<Leaf className="h-5 w-5 text-success xs:h-6 xs:w-6" />}
          label="CO₂ Saved"
          value={impact.co2Kg}
          unit="kg CO₂"
          color="bg-success/10"
        />
        <ImpactCard
          icon={<Zap className="h-5 w-5 text-warning xs:h-6 xs:w-6" />}
          label="Energy Saved"
          value={impact.energyKwh}
          unit="kWh"
          color="bg-warning/10"
        />
        <ImpactCard
          icon={<Droplets className="h-5 w-5 text-info xs:h-6 xs:w-6" />}
          label="Water Saved"
          value={impact.waterLitres}
          unit="litres"
          color="bg-info/10"
        />
        <ImpactCard
          icon={<Trees className="h-5 w-5 text-success xs:h-6 xs:w-6" />}
          label="Trees Equivalent"
          value={impact.treesEquivalent}
          unit="tree-years"
          color="bg-success/10"
        />
      </div>

      {/* Everyday equivalents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">That's equivalent to…</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 xs:gap-3 sm:grid-cols-2">
          <EquivalentRow
            icon={<Car className="h-4 w-4" />}
            value={equivalents.carKm}
            label="km not driven"
          />
          <EquivalentRow
            icon={<Smartphone className="h-4 w-4" />}
            value={equivalents.smartphoneCharges}
            label="smartphone charges"
          />
          <EquivalentRow
            icon={<ShowerHead className="h-4 w-4" />}
            value={equivalents.showerMinutes}
            label="minutes of showering saved"
          />
          <EquivalentRow
            icon={<Lightbulb className="h-4 w-4" />}
            value={equivalents.lightbulbHours}
            label="hours of LED lighting"
          />
        </CardContent>
      </Card>

      {/* Share preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Share your impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="break-words rounded-md bg-muted px-3 py-2 text-xs leading-relaxed xs:px-4 xs:py-3 xs:text-sm">
            {shareText}
          </p>
          <Button onClick={handleShare} className="w-full xs:w-auto">
            {copied ? (
              <><Check className="mr-1 h-4 w-4" /> Copied to clipboard</>
            ) : (
              <><Share2 className="mr-1 h-4 w-4" /> Share on Social Media</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
