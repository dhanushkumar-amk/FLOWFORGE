'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formatDistanceToNow } from 'date-fns';
import {
  Archive,
  Copy,
  GitFork,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Trash2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import {
  useWorkflows,
  useCreateWorkflow,
  useDeleteWorkflow,
  useDuplicateWorkflow,
  type Workflow,
} from '@/hooks/api/useWorkflows';

interface CreateForm {
  name: string;
  description?: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'secondary',
  active: 'default',
  archived: 'outline',
};

export default function WorkflowsPage() {
  const { activeWorkspace } = useAuthStore();
  const wsId = activeWorkspace?._id;
  const { data: workflows = [], isLoading } = useWorkflows(wsId);
  const createMutation = useCreateWorkflow(wsId);
  const deleteMutation = useDeleteWorkflow(wsId);
  const duplicateMutation = useDuplicateWorkflow(wsId);

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>();

  const filtered = workflows.filter((wf) =>
    wf.name.toLowerCase().includes(search.toLowerCase()),
  );

  async function onCreate(data: CreateForm) {
    await createMutation.mutateAsync(data);
    reset();
    setCreateOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} in this workspace
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          New Workflow
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search workflows…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-muted/30"
        />
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <GitFork className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {search ? 'No workflows match your search' : 'No workflows yet'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {search
              ? 'Try a different search term'
              : 'Create your first workflow to get started'}
          </p>
          {!search && (
            <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Create workflow
            </Button>
          )}
        </div>
      )}

      {/* Workflow list */}
      <div className="space-y-2">
        {filtered.map((wf) => (
          <WorkflowCard
            key={wf._id}
            workflow={wf}
            onDelete={() => setDeleteId(wf._id)}
            onDuplicate={() => duplicateMutation.mutate(wf._id)}
          />
        ))}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Workflow</DialogTitle>
            <DialogDescription>
              Give your workflow a name. You'll build the DAG next.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="wf-name">Name</Label>
              <Input
                id="wf-name"
                placeholder="e.g. Data pipeline"
                {...register('name', { required: 'Name is required', minLength: { value: 3, message: 'Minimum 3 characters' } })}
              />
              {errors.name && (
                <p className="text-destructive text-xs">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wf-desc">Description (optional)</Label>
              <Input
                id="wf-desc"
                placeholder="What does this workflow do?"
                {...register('description')}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete workflow?</DialogTitle>
            <DialogDescription>
              This cannot be undone. All execution history will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (deleteId) {
                  await deleteMutation.mutateAsync(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkflowCard({
  workflow,
  onDelete,
  onDuplicate,
}: {
  workflow: Workflow;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const nodeCount = workflow.dagJson?.nodes?.length ?? 0;
  const edgeCount = workflow.dagJson?.edges?.length ?? 0;

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all duration-150 group">
      <CardContent className="px-4 py-3.5">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-primary" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Link
                href={`/workflows/${workflow._id}/builder`}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
              >
                {workflow.name}
              </Link>
              <Badge variant={STATUS_COLORS[workflow.status] as any} className="text-xs capitalize">
                {workflow.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {nodeCount} node{nodeCount !== 1 ? 's' : ''} · {edgeCount} edge{edgeCount !== 1 ? 's' : ''} ·
              Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
            </p>
          </div>

          {/* Tags */}
          {workflow.tags.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
              {workflow.tags.slice(0, 2).map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  {t}
                </Badge>
              ))}
              {workflow.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{workflow.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={`/workflows/${workflow._id}/builder`} className="hidden group-hover:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-accent transition-colors">
                <Play className="w-3 h-3" />
                Open
              </Link>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => window.location.href = `/workflows/${workflow._id}/builder`} className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Open builder
                  </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate} className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
