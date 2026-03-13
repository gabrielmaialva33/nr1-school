import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

interface TableRowsSkeletonProps {
  colSpan: number
  rows?: number
  className?: string
}

export function TableRowsSkeleton({ colSpan, rows = 6, className }: TableRowsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={`table-loading-${index}`} className="hover:bg-transparent">
          <TableCell colSpan={colSpan} className={cn('py-3', className)}>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-40 max-w-[42%]" />
                <Skeleton className="h-4 w-24 max-w-[24%]" />
                <Skeleton className="ml-auto h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-56 max-w-[65%]" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

function DashboardStatSkeletonCard() {
  return (
    <div className="rounded-xl border border-border/80 bg-card/95 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="size-10 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-3 w-36" />
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div className="page-stagger space-y-6" role="status" aria-label="Carregando dashboard">
      <span className="sr-only">Carregando dashboard</span>

      <div className="rounded-xl border border-border/80 bg-card/95 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="size-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-72 max-w-[75%]" />
            <Skeleton className="h-3 w-64 max-w-[60%]" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="ml-auto h-7 w-16" />
            <Skeleton className="ml-auto h-3 w-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <DashboardStatSkeletonCard key={`dashboard-stat-${index}`} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`dashboard-chart-${index}`} className="rounded-xl border border-border/80 bg-card/95 p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-44 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`dashboard-wide-${index}`} className="rounded-xl border border-border/80 bg-card/95 p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-56 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AssessmentsPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando campanhas de diagnóstico">
      <span className="sr-only">Carregando campanhas de diagnóstico</span>

      <div className="space-y-2">
        <Skeleton className="h-8 w-72 max-w-[75%]" />
        <Skeleton className="h-4 w-96 max-w-[85%]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`assessment-card-${index}`}
            className="rounded-2xl border border-border/75 bg-card/95 p-6 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-56 max-w-[80%]" />
                <Skeleton className="h-3.5 w-40 max-w-[55%]" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-3.5 w-48 max-w-[60%]" />
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/80 bg-card/95 p-6">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="mt-2 h-3.5 w-full max-w-2xl" />
        <Skeleton className="mt-5 h-10 w-44 rounded-md" />
      </div>
    </div>
  )
}

export function ActionPlansPageSkeleton() {
  return (
    <div className="page-shell space-y-6" role="status" aria-label="Carregando planos de ação">
      <span className="sr-only">Carregando planos de ação</span>

      <div className="rounded-[30px] border border-border/70 bg-card/85 p-6 shadow-[var(--shadow-soft)] md:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-52 rounded-full" />
            <Skeleton className="h-8 w-56 max-w-[70%]" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-4/5 max-w-xl" />
            <div className="flex flex-wrap gap-2.5">
              <Skeleton className="h-8 w-40 rounded-full" />
              <Skeleton className="h-8 w-36 rounded-full" />
              <Skeleton className="h-8 w-44 rounded-full" />
            </div>
          </div>
          <div className="rounded-[26px] border border-border/70 bg-background/72 p-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-3 h-3.5 w-full" />
            <Skeleton className="mt-2 h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`action-plan-stat-${index}`} className="rounded-2xl border border-border/75 bg-card/95 p-4">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-3 h-8 w-12" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`action-plan-column-${index}`} className="rounded-3xl border border-border/75 bg-card/92 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((__, cardIndex) => (
                <div key={`action-plan-card-${index}-${cardIndex}`} className="rounded-2xl border border-border/65 bg-card/90 p-4">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="mt-3 h-4 w-4/5" />
                  <Skeleton className="mt-2 h-3 w-2/3" />
                  <div className="mt-4 flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmployeeProfilePageSkeleton() {
  return (
    <div className="employee-profile-shell space-y-6" role="status" aria-label="Carregando perfil do colaborador">
      <span className="sr-only">Carregando perfil do colaborador</span>

      <section className="employee-profile-hero">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <Skeleton className="size-18 rounded-full" />
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-9 w-72 max-w-[75%]" />
                <Skeleton className="h-4 w-full max-w-2xl" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`employee-hero-info-${index}`} className="employee-profile-info space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="employee-profile-actions xl:min-w-[400px]">
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`employee-action-${index}`} className="h-10 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`employee-kpi-${index}`} className="employee-profile-kpi">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-8 w-14" />
              </div>
              <Skeleton className="size-11 rounded-2xl" />
            </div>
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`employee-panel-${index}`} className="employee-profile-panel p-5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-3.5 w-64 max-w-[75%]" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 2 }).map((__, rowIndex) => (
                <div key={`employee-row-${index}-${rowIndex}`} className="employee-profile-row">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-44 max-w-[70%]" />
                    <Skeleton className="h-3 w-56 max-w-[85%]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
