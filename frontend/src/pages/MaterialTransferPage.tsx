import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, History, Loader2,Send } from 'lucide-react'
import { useCallback, useEffect,useState } from 'react'

import type { Waste } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useWallet } from '@/context/WalletContext'
import { DestinationStep } from '@/features/transfers/components/DestinationStep'
import { DocumentationStep } from '@/features/transfers/components/DocumentationStep'
import { ReviewStep } from '@/features/transfers/components/ReviewStep'
import { SelectWasteStep } from '@/features/transfers/components/SelectWasteStep'
import { StatusTimeline } from '@/features/transfers/components/StatusTimeline'
import { StepIndicator } from '@/features/transfers/components/StepIndicator'
import { TransferHistoryTab } from '@/features/transfers/components/TransferHistoryTab'
import { WasteChainHistory } from '@/features/transfers/components/WasteChainHistory'
import { INITIAL_FORM,STEPS } from '@/features/transfers/constants'
import { transferDestinationSchema } from '@/features/transfers/schemas'
import { buildTransferNote } from '@/features/transfers/service'
import { addTransferRecord } from '@/features/transfers/transferHistory'
import type { TransferFormData, TransferStep } from '@/features/transfers/types'
import { useAppTitle } from '@/hooks/useAppTitle'
import { useParticipantWastes, useTransferWaste } from '@/hooks/useMaterialTransfer'
import { formatAddress } from '@/lib/helpers'

// ── Page ─────────────────────────────────────────────────────────────────────

export function MaterialTransferPage() {
  useAppTitle('Material Transfer')
  const { address } = useWallet()
  const { data: wastes = [], isLoading } = useParticipantWastes()
  const transfer = useTransferWaste()

  const [step, setStep] = useState<TransferStep>('select')
  const [form, setForm] = useState<TransferFormData>(INITIAL_FORM)
  const [showHistory, setShowHistory] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const updateForm = useCallback((updates: Partial<TransferFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleSelectWaste = useCallback(
    (waste: Waste) => {
      updateForm({ wasteId: waste.waste_id, waste })
    },
    [updateForm]
  )

  const stepIdx = STEPS.findIndex((s) => s.key === step)

  const canProceed = (() => {
    switch (step) {
      case 'select':
        return form.wasteId !== null
      case 'destination':
        return transferDestinationSchema.safeParse({ recipientAddress: form.recipientAddress }).success
      case 'documentation':
        return true // documentation is optional
      case 'review':
        return form.senderConfirmed
      default:
        return false
    }
  })()

  const handleNext = useCallback(() => {
    const nextIdx = stepIdx + 1
    if (nextIdx < STEPS.length) {
      setStep(STEPS[nextIdx].key)
    }
  }, [stepIdx])

  const handlePrev = useCallback(() => {
    const prevIdx = stepIdx - 1
    if (prevIdx >= 0) {
      setStep(STEPS[prevIdx].key)
    }
  }, [stepIdx])

  const handleStepClick = useCallback((targetStep: TransferStep) => {
    setStep(targetStep)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!form.wasteId || !address) return

    try {
      await transfer.mutateAsync({
        wasteId: form.wasteId,
        to: form.recipientAddress,
        note: buildTransferNote(form),
      })

      addTransferRecord({
        wasteId: Number(form.wasteId),
        from: address,
        to: form.recipientAddress,
        transferredAt: Math.floor(Date.now() / 1000),
        notes: form.transferNotes,
        conditionNotes: form.conditionNotes,
        handlingInstructions: form.handlingInstructions,
        status: 'pending',
      })

      setShowSuccess(true)
    } catch {
      // Error is handled by the mutation state
    }
  }, [form, address, transfer])

  const handleReset = useCallback(() => {
    setForm(INITIAL_FORM)
    setStep('select')
    setShowSuccess(false)
  }, [])

  // Reset success banner after navigating away
  useEffect(() => {
    if (showHistory) setShowSuccess(false)
  }, [showHistory])

  if (!address) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Connect your wallet to access material transfers.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:space-y-8 sm:py-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Material Transfer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transfer waste materials to other participants on the network.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowHistory((h) => !h)}
          aria-pressed={showHistory}
        >
          <History className="h-4 w-4" />
          History
        </Button>
      </div>

      {showHistory ? (
        <TransferHistoryTab />
      ) : showSuccess ? (
        /* Success state */
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">Transfer Submitted</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Waste #{form.wasteId?.toString()} has been transferred to{' '}
                {formatAddress(form.recipientAddress)}.
              </p>
            </div>
            <StatusTimeline status="pending" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} aria-label="Start new transfer">
                New Transfer
              </Button>
              <Button
                onClick={() => {
                  setShowHistory(true)
                  setShowSuccess(false)
                }}
                aria-label="View transfer history"
              >
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Step indicator */}
          <StepIndicator currentStep={step} onStepClick={handleStepClick} />

          {/* Step content */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                {STEPS[stepIdx].icon}
                {STEPS[stepIdx].label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 'select' && (
                <div className="space-y-4">
                  <SelectWasteStep
                    wastes={wastes}
                    isLoading={isLoading}
                    selectedId={form.wasteId}
                    onSelect={handleSelectWaste}
                  />
                  {form.wasteId !== null && (
                    <WasteChainHistory wasteId={form.wasteId} />
                  )}
                </div>
              )}
              {step === 'destination' && (
                <DestinationStep
                  recipientAddress={form.recipientAddress}
                  onRecipientChange={(addr) => updateForm({ recipientAddress: addr })}
                />
              )}
              {step === 'documentation' && (
                <DocumentationStep form={form} onChange={updateForm} />
              )}
              {step === 'review' && (
                <ReviewStep
                  form={form}
                  senderAddress={address}
                  onConfirmChange={(confirmed) => updateForm({ senderConfirmed: confirmed })}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={stepIdx === 0}
              className="gap-2"
              aria-label="Go to previous step"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step === 'review' ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || transfer.isPending}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                aria-label="Submit transfer"
              >
                {transfer.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Transfer
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="gap-2"
                aria-label="Go to next step"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mutation error display */}
          {transfer.isError && (
            <div
              className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>
                Transfer failed:{' '}
                {transfer.error instanceof Error
                  ? transfer.error.message
                  : 'An unexpected error occurred'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
