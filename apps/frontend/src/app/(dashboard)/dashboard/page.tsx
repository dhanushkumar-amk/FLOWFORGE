'use client';

import { useAuthStore } from '@/stores/authStore';
import { useWorkflows } from '@/hooks/api/useWorkflows';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  CheckCircle2,
  GitFork,
  Play,
  Plus,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/stores/uiStore';

const STATS = [
  { label: 'Total Workflows', value: '—', icon: GitFork, color: 'text-blue-400' },
  { label: 'Executions This Week', value: '—', icon: Play, color: 'text-green-400' },
  { label: 'Success Rate', value: '—', icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'Active Right Now', value: '0', icon: Activity, color: 'text-orange-400' },
];

export default function DashboardPage() {
  const { activeWorkspace } = useAuthStore();
  const { data: workflows = [], isLoading } = useWorkflows(activeWorkspace?._id);
  const openModal = useUIStore((s) => s.openModal);

  const recent = workflows.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {activeWorkspace ? `${activeWorkspace.name}` : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back — here's what's happening.
          </p>
        </div>
        <Button
          onClick={() => openModal('createWorkflow')}
          className="gap-2"
          size="sm"
        >
          <Plus className="w-3.5 h-3.5" />
          New Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stat.label === 'Total Workflows' ? workflows.length : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Workflows */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <GitFork className="w-4 h-4 text-muted-foreground" />
              Recent Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            )}
            {!isLoading && recent.length === 0 && (
              <div className="text-center py-8">
                <GitFork className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No workflows yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 text-xs"
                  onClick={() => openModal('createWorkflow')}
                >
                  Create your first workflow
                </Button>
              </div>
            )}
            {recent.map((wf) => (
              <Link
                key={wf._id}
                href={`/workflows/${wf._id}/builder`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {wf.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(wf.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs capitalize flex-shrink-0"
                >
                  {wf.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Create new workflow', icon: Plus, onClick: () => openModal('createWorkflow') },
              { label: 'View all workflows', icon: GitFork, href: '/workflows' },
              { label: 'Check executions', icon: Play, href: '/executions' },
              { label: 'Invite team member', icon: Activity, onClick: () => openModal('inviteMember') },
            ].map((action) =>
              action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{action.label}</span>
                </Link>
              ) : (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{action.label}</span>
                </button>
              ),
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
