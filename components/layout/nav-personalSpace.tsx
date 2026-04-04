'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, MoreHorizontal, Plus } from 'lucide-react';

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
  //이미 페이지는 page데이터로 렌더 완료 , 자신의 자식페이지들을 렌더링하기위해 자신의 id를 넘기고 자식들 데이터를 배열로가져와서뿌려줌
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const isCursorOn = useSelectedData((state) => state.isCursorOn);
  const isOpen = useSelectedData((state) => state.openMap[page.id] ?? false);
  const setNodeOpen = useSelectedData((state) => state.setNodeOpen);
  const setisCursorOn = useSelectedData((state) => state.setisCursorOn);
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
        onOpenChange={handleOpenChange}
        open={isOpen}
      >
        <div
          onClick={handleClickCursorOnOff}
          data-active={Number(page.id) === pageNodeID}
          className={`group/row grid w-full grid-cols-[1fr_32px] rounded-md items-center hover:bg-gray-100 data-[active=true]:hover:bg-gray-200 data-[active=true]:bg-gray-100`}
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
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/trigger:rotate-90" />
                </button>
              </CollapsibleTrigger>
            </div>

            <div className="min-w-0 h-8 flex-1 pr-2 hover:bg-transparent">
              <Link
                href={`/dashboard/${session?.user.id}?PageId=${page.id}`}
                className="pl-2 flex h-full min-w-0 flex-1 items-center truncate"
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
              <Plus className="h-4 w-4" />
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
      <div className="group/row grid w-full grid-cols-[1fr_32px] items-center">
        <span className="pl-2 text-sm">Personal Space</span>
        <button
          onClick={handleClickPersonalRootPage}
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md cursor-pointer ml-auto"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <SidebarGroupContent>
        <SidebarMenu>
          {pages.map((page) => (
            <PageTreeNode key={page.id} page={page} depth={0} />
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
