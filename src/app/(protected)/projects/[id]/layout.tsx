'use client';

import { useParams } from 'next/navigation';
import ProjectTabs from '@/components/projects/ProjectTabs';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  return (
    <div className="flex gap-6">
      <div className="w-[200px] min-w-[200px] flex-shrink-0">
        <ProjectTabs projectId={projectId} />
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
