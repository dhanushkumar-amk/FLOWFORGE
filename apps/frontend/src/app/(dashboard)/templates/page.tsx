'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useCreateWorkflow } from '@/hooks/api/useWorkflows';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import {
  Activity,
  ArrowRight,
  Clock,
  GitFork,
  Globe,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BUILT_IN_TEMPLATES = [
  {
    id: 'http-chain',
    name: 'HTTP Request Chain',
    description: 'Fetch data from an API, transform it, then send a notification.',
    tags: ['http', 'transform'],
    icon: Globe,
    complexity: 'Beginner',
    dagJson: {
      nodes: [
        { id: 'n1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'Start', nodeType: 'trigger', config: {} } },
        { id: 'n2', type: 'http', position: { x: 250, y: 180 }, data: { label: 'Fetch Data', nodeType: 'http', config: { method: 'GET', url: 'https://api.example.com/data' } } },
        { id: 'n3', type: 'transform', position: { x: 250, y: 310 }, data: { label: 'Transform', nodeType: 'transform', config: {} } },
        { id: 'n4', type: 'notification', position: { x: 250, y: 440 }, data: { label: 'Notify Team', nodeType: 'notification', config: { channel: '#alerts', message: 'Done!' } } },
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2' },
        { id: 'e2-3', source: 'n2', target: 'n3' },
        { id: 'e3-4', source: 'n3', target: 'n4' },
      ],
    },
  },
  {
    id: 'conditional-branch',
    name: 'Conditional Branch',
    description: 'Route workflow execution based on a condition result.',
    tags: ['condition', 'branching'],
    icon: GitFork,
    complexity: 'Intermediate',
    dagJson: {
      nodes: [
        { id: 'n1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'Start', nodeType: 'trigger', config: {} } },
        { id: 'n2', type: 'http', position: { x: 250, y: 180 }, data: { label: 'Check Status', nodeType: 'http', config: { method: 'GET', url: '' } } },
        { id: 'n3', type: 'condition', position: { x: 250, y: 310 }, data: { label: 'Is OK?', nodeType: 'condition', config: { expression: "data.status === 'ok'" } } },
        { id: 'n4', type: 'notification', position: { x: 100, y: 440 }, data: { label: 'Success Notify', nodeType: 'notification', config: { message: 'All good!' } } },
        { id: 'n5', type: 'notification', position: { x: 400, y: 440 }, data: { label: 'Error Notify', nodeType: 'notification', config: { message: 'Something failed' } } },
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2' },
        { id: 'e2-3', source: 'n2', target: 'n3' },
        { id: 'e3-4', source: 'n3', target: 'n4' },
        { id: 'e3-5', source: 'n3', target: 'n5', sourceHandle: 'false' },
      ],
    },
  },
  {
    id: 'scheduled-report',
    name: 'Scheduled Report',
    description: 'Fetch data on a schedule and send a formatted report notification.',
    tags: ['scheduled', 'http', 'notification'],
    icon: Clock,
    complexity: 'Beginner',
    dagJson: {
      nodes: [
        { id: 'n1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'Cron Trigger', nodeType: 'trigger', config: {} } },
        { id: 'n2', type: 'http', position: { x: 250, y: 180 }, data: { label: 'Fetch Report Data', nodeType: 'http', config: { method: 'GET', url: 'https://api.example.com/report' } } },
        { id: 'n3', type: 'delay', position: { x: 250, y: 310 }, data: { label: 'Wait 1s', nodeType: 'delay', config: { delayMs: 1000 } } },
        { id: 'n4', type: 'notification', position: { x: 250, y: 440 }, data: { label: 'Send Report', nodeType: 'notification', config: { channel: '#reports', message: 'Weekly report ready' } } },
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2' },
        { id: 'e2-3', source: 'n2', target: 'n3' },
        { id: 'e3-4', source: 'n3', target: 'n4' },
      ],
    },
  },
];

const COMPLEXITY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function TemplatesPage() {
  const { activeWorkspace } = useAuthStore();
  const createMutation = useCreateWorkflow(activeWorkspace?._id);

  async function useTemplate(template: (typeof BUILT_IN_TEMPLATES)[0]) {
    if (!activeWorkspace) {
      toast.error('Select a workspace first');
      return;
    }
    const workflow = await createMutation.mutateAsync({
      name: template.name,
      description: template.description,
      tags: template.tags,
    });
    // Save the template dagJson
    await apiClient.put(`/api/workflows/${workflow._id}/dag`, {
      dagJson: template.dagJson,
    });
    toast.success('Template loaded — opening builder…');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Templates</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Start from a pre-built workflow and customise it.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BUILT_IN_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="bg-card border-border hover:border-primary/30 transition-all duration-200 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded border ${COMPLEXITY_COLORS[template.complexity]}`}
                      >
                        {template.complexity}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  {template.dagJson.nodes.length} nodes · {template.dagJson.edges.length} edges
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => useTemplate(template)}
                  disabled={createMutation.isPending}
                >
                  Use Template
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
