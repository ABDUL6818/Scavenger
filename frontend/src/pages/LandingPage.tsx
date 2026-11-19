import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Recycle, Truck, Factory } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useStats } from '@/hooks/useStats'
import { useAppTitle } from '@/hooks/useAppTitle'

const STEPS = [
  {
    icon: Recycle,
    titleKey: 'landing.steps.recycle.title',
    descriptionKey: 'landing.steps.recycle.description',
  },
  {
    icon: Truck,
    titleKey: 'landing.steps.collect.title',
    descriptionKey: 'landing.steps.collect.description',
  },
  {
    icon: Factory,
    titleKey: 'landing.steps.manufacture.title',
    descriptionKey: 'landing.steps.manufacture.description',
  },
]

const FOOTER_LINKS = [
  { labelKey: 'landing.footer.github', href: 'https://github.com' },
  { labelKey: 'landing.footer.twitter', href: 'https://twitter.com' },
]

export function LandingPage() {
  const { t } = useTranslation()
  useAppTitle(t('landing.appTitle'))
  const { totalWastes, totalWeight, totalTokens, isLoading } = useStats()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="flex h-14 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 font-bold">
          <Recycle className="h-5 w-5 text-primary" aria-hidden="true" />
          {t('landing.brand')}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/dashboard">{t('landing.launchApp')}</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {t('landing.hero.title')}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {t('landing.hero.description')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">{t('landing.hero.getStarted')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com" target="_blank" rel="noreferrer">
                {t('landing.hero.viewOnGitHub')}
              </a>
            </Button>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t bg-muted/40 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-2xl font-bold">{t('landing.howItWorks.title')}</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.titleKey} className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('landing.howItWorks.step', { number: i + 1 })}
                  </span>
                  <h3 className="text-lg font-semibold">{t(step.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(step.descriptionKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live stats */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-2xl font-bold">{t('landing.stats.title')}</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  labelKey: 'landing.stats.wasteItems',
                  value: isLoading ? '—' : totalWastes.toString(),
                },
                {
                  labelKey: 'landing.stats.totalWeight',
                  value: isLoading ? '—' : totalWeight.toString(),
                },
                {
                  labelKey: 'landing.stats.tokensDistributed',
                  value: isLoading ? '—' : totalTokens.toString(),
                },
              ].map((stat) => (
                <div
                  key={stat.labelKey}
                  className="rounded-lg border bg-card p-6 text-center shadow-sm"
                >
                  <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Recycle className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('landing.brand')}
          </div>
          <div className="flex gap-4">
            {FOOTER_LINKS.map(({ labelKey, href }) => (
              <a
                key={labelKey}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center gap-1.5 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(labelKey)}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('landing.footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  )
}
