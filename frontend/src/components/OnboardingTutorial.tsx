import React, { useEffect, useId, useRef, useState } from 'react'
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride'
import { useOnboarding } from '@/hooks/useOnboarding'
import { getOnboardingSteps, getOnboardingStyles } from '@/lib/onboardingSteps'
import { UserRole } from '@/hooks/useOnboarding'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { Play } from 'lucide-react'

interface OnboardingTutorialProps {
  userRole: UserRole | null
  isVisible: boolean
  onComplete: () => void
}

export function OnboardingTutorial({ userRole, isVisible, onComplete }: OnboardingTutorialProps) {
  const { state, startOnboarding, completeOnboarding, skipOnboarding, updateStep } = useOnboarding()
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const titleId = useId()
  const descriptionId = useId()
  const dialogContentRef = useRef<HTMLDivElement>(null)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // Trap focus inside the welcome dialog and restore it on close (WCAG 2.1 AA)
  useFocusTrap({
    active: showWelcomeDialog,
    containerRef: dialogContentRef,
    initialFocusRef: startButtonRef,
    onEscape: () => setShowWelcomeDialog(false),
    restoreFocusRef: previouslyFocusedRef,
  })

  useEffect(() => {
    if (isVisible && userRole && !state.completed && !state.skipped) {
      // Remember the trigger element so focus can be restored when the dialog closes
      if (typeof document !== 'undefined') {
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null
      }
      setShowWelcomeDialog(true)
    }
  }, [isVisible, userRole, state.completed, state.skipped])

  const handleStartTutorial = () => {
    if (userRole) {
      startOnboarding(userRole)
      setShowWelcomeDialog(false)
    }
  }

  const handleSkipTutorial = () => {
    skipOnboarding()
    setShowWelcomeDialog(false)
    onComplete()
  }

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data

    if (type === EVENTS.STEP_AFTER) {
      updateStep(index + 1)
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      completeOnboarding()
      onComplete()
    }
  }

  const steps = userRole ? getOnboardingSteps(userRole) : []

  if (!isVisible || !userRole) {
    return null
  }

  return (
    <>
      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent
          ref={dialogContentRef}
          className="sm:max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <DialogHeader>
            <DialogTitle id={titleId} className="flex items-center gap-2">
              <Play className="h-5 w-5" aria-hidden="true" />
              Welcome to Scavenger!
            </DialogTitle>
            <DialogDescription id={descriptionId}>
              Let's take a quick interactive tour to help you get familiar with the platform.
              We'll highlight key features and show you how to make the most of your {userRole.toLowerCase()} role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dont-show-again"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                aria-label="Don't show this again"
              />
              <label
                htmlFor="dont-show-again"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Don't show this again
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSkipTutorial} aria-label="Skip tutorial">
                Skip Tutorial
              </Button>
              <Button ref={startButtonRef} onClick={handleStartTutorial} aria-label="Start tour">
                Start Tour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Joyride Tutorial */}
      <Joyride
        steps={steps}
        run={state.role === userRole && !state.completed && !state.skipped}
        callback={handleJoyrideCallback}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        disableCloseOnEsc
        styles={getOnboardingStyles()}
        locale={{
          back: 'Previous',
          close: 'Close tutorial',
          last: 'Finish',
          next: 'Next',
          open: 'Open',
          skip: 'Skip tutorial',
        }}
        aria-label="Onboarding tutorial"
      />
    </>
  )
}

// Hook to easily use onboarding in components
export function useOnboardingTutorial(userRole: UserRole | null) {
  const { shouldShowOnboarding, resetOnboarding } = useOnboarding()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (userRole) {
      const shouldShow = shouldShowOnboarding(userRole)
      setIsVisible(shouldShow)
    }
  }, [userRole, shouldShowOnboarding])

  const hideTutorial = () => {
    setIsVisible(false)
  }

  const restartTutorial = () => {
    resetOnboarding()
    setIsVisible(true)
  }

  return {
    isVisible,
    hideTutorial,
    restartTutorial,
  }
}