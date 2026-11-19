import { Award, Trophy, Star, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAppTitle } from '@/hooks/useAppTitle'
import { LeaderboardRow } from '@/design-system'
import { ContributorRecognition } from '@/components/community/ContributorRecognition'

interface LeaderboardEntry {
  rank: number
  address: string
  points: number
  wasteCount: number
  badge: string
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, address: 'GAXYZ...ABC123', points: 15420, wasteCount: 87, badge: 'gold' },
  { rank: 2, address: 'GBDEF...XYZ789', points: 12350, wasteCount: 72, badge: 'silver' },
  { rank: 3, address: 'GCHIJ...LMN456', points: 10890, wasteCount: 65, badge: 'bronze' },
  { rank: 4, address: 'GDKLM...OPQ321', points: 9240, wasteCount: 58, badge: 'risingStar' },
  { rank: 5, address: 'GENOP...RST654', points: 8150, wasteCount: 51, badge: 'contributor' }
]

const achievements = [
  {
    icon: Trophy,
    titleKey: 'community.achievements.firstRecycler.title',
    descriptionKey: 'community.achievements.firstRecycler.description',
    unlocked: true
  },
  {
    icon: Star,
    titleKey: 'community.achievements.ecoWarrior.title',
    descriptionKey: 'community.achievements.ecoWarrior.description',
    unlocked: true
  },
  {
    icon: Award,
    titleKey: 'community.achievements.communityLeader.title',
    descriptionKey: 'community.achievements.communityLeader.description',
    unlocked: false
  },
  {
    icon: TrendingUp,
    titleKey: 'community.achievements.consistencyKing.title',
    descriptionKey: 'community.achievements.consistencyKing.description',
    unlocked: false
  }
]

export function CommunityPage() {
  const { t } = useTranslation()
  useAppTitle(t('community.title'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('community.heading')}</h1>
        <p className="mt-1 text-muted-foreground">{t('community.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {t('community.leaderboard.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLeaderboard.map((entry) => (
                <LeaderboardRow
                  key={entry.rank}
                  rank={entry.rank}
                  address={entry.address}
                  points={entry.points}
                  tier={t(`community.leaderboard.badges.${entry.badge}`)}
                >
                  <div className="text-xs text-muted-foreground">
                    {t('community.leaderboard.itemsRecycled', { count: entry.wasteCount })}
                  </div>
                </LeaderboardRow>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t('community.achievements.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 rounded-lg border p-3 ${
                      achievement.unlocked ? 'bg-primary/5' : 'opacity-50'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{t(achievement.titleKey)}</div>
                      <div className="text-xs text-muted-foreground">
                        {t(achievement.descriptionKey)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('community.stats.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('community.stats.totalMembers')}
                </span>
                <span className="text-xl font-bold">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('community.stats.activeToday')}
                </span>
                <span className="text-xl font-bold">342</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('community.stats.itemsRecycled')}
                </span>
                <span className="text-xl font-bold">45.2K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('community.rank.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">#127</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('community.rank.topPercent', { percent: 11 })}
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[89%] bg-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('community.milestone.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="font-medium">{t('community.milestone.target')}</div>
                  <div className="text-xs text-muted-foreground">
                    {t('community.milestone.pointsToGo', { points: 850 })}
                  </div>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[65%] bg-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contributor Recognition Program */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          {t('community.contributorRecognition.title')}
        </h2>
        <ContributorRecognition />
      </div>
    </div>
  )
}
