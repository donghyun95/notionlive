'use client';

import * as React from 'react';
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { NavPersonalSpace } from './nav-personalSpace';
import { NavMain } from './nav-main';
import { NavSecondary } from './nav-secondary';
import { NavWorkspaces } from './nav-workspaces';
import { TeamSwitcher } from './team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSidebarData } from '@/lib/api/getSidebarData';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

import { useEffect, useRef } from 'react';
import { useSelectedData } from '@/app/Providers/ClientDataProvider';
import { getAncestorPathFetch } from '@/lib/api/getAncestorPathFetch';

import { set } from 'zod';
import { SidebarUtilities } from './nav-sidebarUtilities';
import { Separator } from '../ui/separator';
import { SidebarUserInfo } from './nav-sidebarUserInfo';

const isPositiveInt = (n) => Number.isInteger(n) && n > 0;

export function AppSidebar({
  initialPage,
  ...props
}: { initialPage: any } & React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const searchParamsPageId = searchParams.get('PageId');
  const setPageNodeID = useSelectedData((state) => state.setPageNodeID);
  const hasAppliedAncestorPathRef = useRef(false);
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const setNodeopenBatch = useSelectedData((state) => state.setNodesOpenBatch);
  const setNodeOpen = useSelectedData((state) => state.setNodeOpen);
  const setWorkspaceOpen = useSelectedData((state) => state.setWorkspaceOpen);
  const queryClient = useQueryClient();

  if (!searchParamsPageId) {
  }
  const userId = session?.user.id;
  const { data: user } = useQuery({
    queryKey: ['initialPage', userId],
    queryFn: getSidebarData,
    initialData: initialPage,
    staleTime: 1000 * 30,
  });
  const { data: ancestorPath } = useQuery({
    queryKey: [
      'ancestorPath',
      searchParamsPageId ? searchParamsPageId : pageNodeID,
    ],
    queryFn: () =>
      getAncestorPathFetch(
        searchParamsPageId ? searchParamsPageId : pageNodeID,
      ),
    staleTime: 0,
  });

  useEffect(() => {
    const searchParamsPageId = searchParams.get('PageId');
    const num = Number(searchParamsPageId);

    if (!searchParamsPageId || !isPositiveInt(num)) return;

    setPageNodeID((prev) => {
      if (prev === num) return prev;
      return num;
    });
  }, [searchParams]);
  const lastAppliedPageIdRef = useRef<number | null>(null);
  const targetPageId = searchParamsPageId ? Number(searchParamsPageId) : null;
  useEffect(() => {
    if (!ancestorPath || !Array.isArray(ancestorPath.path)) return;
    if (!targetPageId) return;

    if (lastAppliedPageIdRef.current === targetPageId) return;
    setNodeopenBatch(ancestorPath.path, true);
    setNodeOpen(`workspace-${ancestorPath.workspaceID}`, true);
    lastAppliedPageIdRef.current = targetPageId;
  }, [targetPageId, ancestorPath]);

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="px-2 py-2">
        <SidebarUserInfo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarUtilities />
        <Separator className="my-2 bg-stone-200" />
        <NavWorkspaces workspaces={user.workspaces} userId={userId} />
        <NavPersonalSpace pages={user.personal.rootPages} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
