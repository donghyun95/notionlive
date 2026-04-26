'use client';

import { useEffect, useState } from 'react';
import {
  ChevronRight,
  MoreHorizontal,
  Plus,
  Folder,
  FolderOpen,
  UserRound,
  User2,
} from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  useMutation,
  useQueryClient,
  useQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { createPage } from '@/lib/api/createPage';
import { getSelfandChildrenFetch } from '@/lib/api/getSelfandChildrenFetch';
import Link from 'next/link';
import { useSelectedData } from '@/app/Providers/ClientDataProvider';

type Page = {
  id: string;
  title: string;
  href?: string;
  hasChildren?: boolean;
  icon: string;
  isDummy?: boolean;
};
type WorkspaceData = {
  workspaces: any[];
  personal: {
    workspace: {
      id: number;
      name: string;
      type: string;
      createdAt: string;
      updatedAt: string;
    };
    rootPages: any[];
  };
};
type PageTreeNodeProps = {
  page: Page;
  depth: number;
};
const INDENT_SIZE = 12;
const TOGGLE_WIDTH = 20;

function PageTreeNode({ page, depth }: PageTreeNodeProps) {
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const isCursorOn = useSelectedData((state) => state.isCursorOn);
  const isOpen = useSelectedData((state) => state.openMap[page.id] ?? false);
  const setNodeOpen = useSelectedData((state) => state.setNodeOpen);
  const setisCursorOn = useSelectedData((state) => state.setisCursorOn);
  const isActive = Number(page.id) === Number(pageNodeID);
  const { data: session, status } = useSession();
  //자식페이지 배열로 가져옴
  const { data: selfAndChildren } = useQuery({
    queryKey: ['page', page.id],
    queryFn: () => getSelfandChildrenFetch(page.id),
    staleTime: 1000 * 30,
    enabled: true,
  });
  const queryClient = useQueryClient();
  const createChildMutation = useMutation({
    mutationFn: createPage,

    onMutate: async (parentId: string) => {
      const queryKey = ['page', parentId];

      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData(queryKey);
      const date = new Date('2024-12-25');
      const dummyChild = {
        id: 0,
        title: 'Untitled',
        icon: '📄',
        parentId,
        createdAt: date,
        updatedAt: date,
        isDummy: true,
      };

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          children: [...(old.children ?? []), dummyChild],
        };
      });

      return { previous, queryKey };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(ctx.queryKey, ctx.previous);
    },

    onSettled: async (_data, _err, parentId) => {
      await queryClient.invalidateQueries({
        queryKey: ['page', parentId],
      });
    },
  });
  const handleCreateChild = () => {
    createChildMutation.mutate(page.id);
  };
  const indent = depth * INDENT_SIZE;
  const childIndent = (depth + 1) * INDENT_SIZE + TOGGLE_WIDTH;
  const handleClickCursorOnOff = (ev) => {
    if (isCursorOn) setisCursorOn(false);
  };
  function handleOpenChange(nextOpen: boolean) {
    console.log('onOpenChange nextOpen:', nextOpen);
    setNodeOpen(page.id, nextOpen);
  }

  //onOpenChange={}
  return (
    <SidebarMenuItem className="w-full list-none">
      <Collapsible
        className="w-full"
        onOpenChange={page.isDummy ? undefined : handleOpenChange}
        open={isOpen}
      >
        <div
          onClick={page.isDummy ? undefined : handleClickCursorOnOff}
          data-active={isActive}
          className={`group/row grid w-full grid-cols-[1fr_32px] rounded-md items-center hover:bg-[#e7e9e2] ${
            isActive ? 'bg-[#e0e4dc]' : ''
          }`}
        >
          <div
            className="flex min-w-0 items-center"
            style={{ paddingLeft: indent }}
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center transition-opacity group-hover/row:opacity-0">
                <span className="text-lg leading-none">
                  {selfAndChildren?.self?.icon || '📄'}
                </span>
              </div>

              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="group/trigger absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/row:opacity-100"
                >
                  <ChevronRight className="h-4 w-4 text-[#5c605a] transition-transform duration-200 group-data-[state=open]/trigger:rotate-90" />
                </button>
              </CollapsibleTrigger>
            </div>

            <div className="min-w-0 h-8 flex-1 pr-2 hover:bg-transparent">
              <Link
                href={
                  page.isDummy
                    ? '#'
                    : `/dashboard/${session?.user.id}?PageId=${page.id}`
                }
                onClick={(e) => {
                  if (page.isDummy) e.preventDefault();
                }}
                className={`pl-2 flex h-full min-w-0 flex-1 items-center truncate ${
                  isActive ? 'text-[#4F46E5] font-medium' : 'text-[#30332e]'
                } ${page.isDummy ? 'pointer-events-none text-[#8a8f86]' : ''}`}
                title={page.title}
              >
                {selfAndChildren?.self?.title || 'Untitled'}
              </Link>
            </div>
          </div>

          <div className="flex h-8 w-8 items-center justify-center">
            <button
              type="button"
              onClick={handleCreateChild}
              className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/row:opacity-100 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#5c605a]" />
            </button>
          </div>
        </div>

        <CollapsibleContent className="w-full">
          {selfAndChildren?.children?.length > 0 && (
            <ul className="w-full min-w-0">
              {selfAndChildren.children.map((child) => (
                <PageTreeNode key={child.id} page={child} depth={depth + 1} />
              ))}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

type NavPersonalSpaceProps = {
  pages: Page[];
};

export function NavPersonalSpace({ pages }: NavPersonalSpaceProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPage,
    onMutate: async () => {
      const queryKey = ['initialPage', session?.user.id];
      await queryClient.cancelQueries({ queryKey });
      const previousPages = queryClient.getQueryData<WorkspaceData>(queryKey);
      if (!previousPages) return;
      const DummyPersonalSpaceRootItem = {
        authorId: session?.user.id,
        createdAt: new Date().toString(),
        icon: null,
        id: Date.now(),
        order: previousPages.personal.rootPages.length,
        parentId: null,
        title: 'Untitled',
        updatedAt: new Date().toString(),
        workspaceId: 1,
      };
      queryClient.setQueryData<WorkspaceData>(queryKey, (old) => {
        if (!old) return old;
        const value = {
          ...old,
          personal: {
            ...old.personal,
            rootPages: [
              ...(old.personal?.rootPages ?? []),
              DummyPersonalSpaceRootItem,
            ],
          },
        };
        return value;
      });
      return { previousPages };
    },

    onError: (_error, _vars, context) => {
      console.log('❌ 에러 발생 → 롤백');
      if (!context?.previousPages) return;
      queryClient.setQueryData(
        ['initialPage', session?.user.id],
        context?.previousPages,
      );
    },
    onSettled: async () => {
      console.log('🔄 invalidate → 서버 동기화');

      await queryClient.invalidateQueries({
        queryKey: ['initialPage', session?.user.id],
      });
    },
  });
  const handleClickPersonalRootPage = () => {
    //null = 부모페이지를 누구로할것인지
    mutation.mutate(null);
  };
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <Collapsible defaultOpen className="w-full group/collapsible">
        <div className="group/row grid w-full grid-cols-[1fr_32px] items-center">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group/trigger flex h-8 items-center gap-2 rounded-sm pl-2"
            >
              <span className="text-[#5c605a]/60 text-xs font-bold uppercase tracking-widest">
                Personal Space
              </span>
            </button>
          </CollapsibleTrigger>

          <button
            onClick={handleClickPersonalRootPage}
            type="button"
            className="ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-md"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <CollapsibleContent className="max-h-[225px] overflow-y-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {pages.map((page) => (
                <PageTreeNode key={page.id} page={page} depth={1} />
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <MoreHorizontal />
                  <span>More</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
