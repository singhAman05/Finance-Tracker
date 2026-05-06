"use client";

/**
 * Boneyard fixture components.
 * These render the same DOM structure as real pages (without data).
 * The boneyard CLI captures their layout to generate skeleton bones.
 */

export function DashboardFixture() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-10 w-28 bg-muted rounded-lg" />
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <div className="h-5 w-40 bg-muted rounded mb-4" />
        <div className="h-[200px] bg-muted/30 rounded-xl" />
      </div>
      {/* Recent transactions */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <div className="h-5 w-44 bg-muted rounded" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className="h-10 w-10 bg-muted rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="h-5 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransactionsFixture() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-40 bg-muted rounded" />
          <div className="h-4 w-56 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-muted rounded-lg" />
          <div className="h-10 w-32 bg-muted rounded-lg" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-7 w-28 bg-muted rounded" />
          </div>
        ))}
      </div>
      {/* Search & filters */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-muted rounded-lg" />
        <div className="h-10 w-32 bg-muted rounded-lg" />
        <div className="h-10 w-32 bg-muted rounded-lg" />
      </div>
      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-12 bg-muted/30 border-b border-border" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-36 bg-muted rounded flex-1" />
            <div className="h-5 w-20 bg-muted rounded-full" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountsFixture() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-36 bg-muted rounded" />
          <div className="h-4 w-52 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-muted rounded-lg" />
          <div className="h-10 w-32 bg-muted rounded-lg" />
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-7 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
      {/* Search */}
      <div className="h-10 w-full bg-muted rounded-lg" />
      {/* Account cards / table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-5 border-b border-border last:border-0">
            <div className="h-12 w-12 bg-muted rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BillsFixture() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-28 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-muted rounded-lg" />
          <div className="h-10 w-28 bg-muted rounded-lg" />
        </div>
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-7 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
      {/* Bill instance cards */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-card flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-6 w-20 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetsFixture() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-muted rounded-lg" />
          <div className="h-10 w-32 bg-muted rounded-lg" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-7 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <div className="h-5 w-36 bg-muted rounded mb-4" />
        <div className="h-[180px] bg-muted/30 rounded-xl" />
      </div>
      {/* Budget cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded-xl" />
              <div className="space-y-1 flex-1">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full" />
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsFixture() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-4 w-56 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-muted rounded-lg" />
          <div className="h-10 w-10 bg-muted rounded-lg" />
        </div>
      </div>
      {/* Period selector */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 bg-muted rounded-lg" />
        ))}
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-7 w-28 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <div className="h-5 w-40 bg-muted rounded mb-4" />
        <div className="h-[250px] bg-muted/30 rounded-xl" />
      </div>
    </div>
  );
}

export function SettingsFixture() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-4 w-56 bg-muted rounded" />
      </div>
      {/* Settings sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="h-5 w-36 bg-muted rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
              <div className="h-6 w-12 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
