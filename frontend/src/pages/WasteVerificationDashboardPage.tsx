import { Download, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { BulkVerificationPanel } from '@/features/verification/components/BulkVerificationPanel'
import { DashboardStats } from '@/features/verification/components/DashboardStats'
import { DetailPanel } from '@/features/verification/components/DetailPanel'
import { FilterBar } from '@/features/verification/components/FilterBar'
import { ResultsList } from '@/features/verification/components/ResultsList'
import { useAppTitle } from '@/hooks/useAppTitle'
import { useVerificationDashboard } from '@/hooks/useVerificationDashboard'

// ── Page ─────────────────────────────────────────────────────────────────────

export function WasteVerificationDashboardPage() {
  useAppTitle('Verification Dashboard')
  const d = useVerificationDashboard()

  // Not connected state
  if (!d.address) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Connect your wallet to access the verification dashboard.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Verification Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, verify, and manage waste material submissions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start"
          onClick={d.handleExport}
          disabled={d.filteredMaterials.length === 0}
          aria-label="Export results as CSV"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <DashboardStats materials={d.allMaterials} isLoading={d.isLoading} />

      {/* Filters */}
      <FilterBar
        searchQuery={d.searchQuery}
        onSearchChange={d.setSearchQuery}
        statusFilter={d.statusFilter}
        onStatusChange={d.setStatusFilter}
        wasteTypeFilter={d.wasteTypeFilter}
        onWasteTypeChange={d.setWasteTypeFilter}
        dateFrom={d.dateFrom}
        dateTo={d.dateTo}
        onDateFromChange={d.setDateFrom}
        onDateToChange={d.setDateTo}
        showFilters={d.showFilters}
        onToggleFilters={d.toggleFilters}
      />

      {/* Bulk actions */}
      <BulkVerificationPanel
        selectedIds={d.checkedIds}
        materials={d.allMaterials}
        onBulkAction={d.handleBulkAction}
        onClearSelection={() => d.setCheckedIds(new Set())}
        isPending={d.verify.isPending}
      />

      {/* Main content: list + detail */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ResultsList
          materials={d.filteredMaterials}
          isLoading={d.isLoading}
          selectedId={d.selectedId}
          checkedIds={d.checkedIds}
          onSelect={d.setSelectedId}
          onCheck={d.handleCheckItem}
          onSelectAll={d.handleSelectAll}
          sortField={d.sortField}
          sortDir={d.sortDir}
          onSort={d.handleSort}
          hasActiveFilters={d.hasActiveFilters}
          onClearFilters={d.clearFilters}
        />

        {/* Right: detail panel */}
        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          {d.selectedMaterial ? (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <DetailPanel
                  material={d.selectedMaterial}
                  onVerify={d.handleVerify}
                  isVerifying={d.verify.isPending}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-muted-foreground">
              <ShieldCheck className="h-10 w-10 opacity-30" />
              <p className="text-sm">Select a material to view details and verify.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
