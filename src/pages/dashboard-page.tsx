import { ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

/**
 * Dashboard — a shell demonstration page, not a finished analytics module.
 * Sample figures are labelled as sample data; real queries arrive in later phases.
 * Layout deliberately avoids a grid of identical cards: KPIs read as one
 * divided ledger strip, then a wide activity table beside a narrow queue panel.
 */
const KPIS = [
  { label: 'Revenue (November)', value: '₫1.284B', delta: '+8.2% vs October', up: true },
  { label: 'Open sales orders', value: '146', delta: '+12 today', up: true },
  { label: 'Stock below reorder point', value: '9 items', delta: '-3 vs last week', up: false },
  { label: 'Payables due in 7 days', value: '₫96.4M', delta: '4 suppliers', up: false },
]

const ACTIVITY = [
  { ref: 'SO-2041', detail: 'Sales order confirmed — An Phat Trading', owner: 'Lan Anh', status: 'Confirmed', variant: 'default' as const },
  { ref: 'PO-0873', detail: 'Purchase order sent — Mekong Packaging', owner: 'Tuan', status: 'Waiting delivery', variant: 'warning' as const },
  { ref: 'SKU-1042', detail: 'Safety stock reached reorder point', owner: 'System', status: 'Needs purchase', variant: 'destructive' as const },
  { ref: 'INV-3118', detail: 'Invoice issued — Binh Minh Retail', owner: 'Ha', status: 'Sent', variant: 'secondary' as const },
  { ref: 'REQ-051', detail: 'Leave request approved — 2 days', owner: 'HR', status: 'Approved', variant: 'secondary' as const },
]

const QUEUE = [
  { label: 'Purchase orders to approve', count: 3 },
  { label: 'Invoices to send', count: 7 },
  { label: 'Stock counts to recount', count: 2 },
  { label: 'New employees to onboard', count: 1 },
]

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Good afternoon, Richard"
        description="Here is the operating picture for Tuesday, 18 November. Figures below are sample data that demonstrate the shell — live module data arrives in later phases."
        badge="Sample data"
        actions={
          <>
            <Button variant="outline">
              Export summary
            </Button>
            <Button>
              <Plus data-icon="inline-start" aria-hidden="true" />
              New sales order
            </Button>
          </>
        }
      />

      {/* KPI ledger strip — one divided surface, not four floating cards. */}
      <section aria-label="Key figures">
        <dl className="grid grid-cols-1 divide-y rounded-lg border bg-card shadow-sm sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="flex flex-col gap-1 p-5">
              <dt className="text-sm text-muted-foreground">{kpi.label}</dt>
              <dd className="tnum font-display text-3xl font-semibold tracking-tight">{kpi.value}</dd>
              <dd className="flex items-center gap-1 text-sm text-muted-foreground">
                {kpi.up ? (
                  <ArrowUpRight aria-hidden="true" className="size-4 text-primary" />
                ) : (
                  <ArrowDownRight aria-hidden="true" className="size-4 text-warning" />
                )}
                {kpi.delta}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest movements across sales, purchasing, inventory and people.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <caption className="sr-only">Recent activity across modules</caption>
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="py-2 pr-4 font-medium">Reference</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Detail</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Owner</th>
                    <th scope="col" className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ACTIVITY.map((row) => (
                    <tr key={row.ref} className="border-b transition-colors last:border-b-0 hover:bg-accent/60">
                      <td className="py-3 pr-4 font-mono text-xs whitespace-nowrap">{row.ref}</td>
                      <td className="py-3 pr-4">{row.detail}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{row.owner}</td>
                      <td className="py-3">
                        <Badge variant={row.variant}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Showing sample rows. <Link to="/reports" className="font-medium text-primary underline-offset-4 hover:underline">Open reports</Link> when that module is built.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waiting on you</CardTitle>
            <CardDescription>Approvals and checks that need a person, not a system.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {QUEUE.map((item, index) => (
                <li key={item.label}>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="min-w-0 text-sm">{item.label}</span>
                    <Badge variant="secondary" className="tnum shrink-0">{item.count}</Badge>
                  </div>
                  {index < QUEUE.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
