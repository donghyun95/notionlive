'use client';

import { useState } from 'react';
import { ChevronRight, MoreHorizontal, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
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
import { createWorkSpacePageFetch } from '@/lib/api/createWorkSpacePageFetch';

import { useSelectedData } from '@/app/Providers/ClientDataProvider';
import Link from 'next/link';
import { getSelfandChildrenFetch } from '@/lib/api/getSelfandChildrenFetch';
import {
  useMutation,
  useQueryClient,
  useQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import { WorkspaceSettingsDialog } from './workspaceModal';
import { set } from 'zod';

type Page = {
  id: string | number;
  workspaceId: string | number;
  parentId: string | number | null;
  authorId?: string;
  title: string;
  icon?: string | null;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Workspace = {
  id: number;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  rootPages: Page[];
};

type NavWorkspacesProps = {
  workspaces: Workspace[];
};

type PageTreeNodeProps = {
  page: any;
  depth: number;
};

type CreatePageRequest = {
  workspaceID: number;
  parentId: number | null;
};
const INDENT_SIZE = 12;
const TOGGLE_WIDTH = 20;

export function PageTreeNode({ page, depth }: PageTreeNodeProps) {
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
    mutationFn: createWorkSpacePageFetch,

    onMutate: async (variables: CreatePageRequest) => {
      if (variables.parentId === null) {
        return;
      }
      const queryKey = ['page', variables.parentId];

      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData(queryKey);
      const date = new Date('2024-12-25');
      const dummyChild = {
        id: 0,
        title: 'Untitled',
        icon: '📄',
        parentId: variables.parentId,
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

    onSettled: async (_data, _err, variables) => {
      const { workspaceId, parentId } = variables;
      if (parentId === null) {
        await queryClient.invalidateQueries({
          queryKey: ['initialPage', session?.user.id],
        });
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ['page', parentId],
      });
    },
  });
  const handleCreateChild = () => {
    createChildMutation.mutate({
      workspaceID: selfAndChildren.self.workspaceId,
      parentId: page.id,
    });
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

export function NavWorkspaces({ workspaces }: NavWorkspacesProps) {
  const [open, setOpen] = useState(true);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="group/row grid w-full grid-cols-[1fr_32px] items-center">
        <span className="pl-2 text-sm">Workspace</span>
        <button
          onClick={() => setOpen((prev) => !prev)}
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md cursor-pointer ml-auto"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {workspaces.map((workspace) => (
        <WorkSpaceFolder
          key={workspace.id}
          workSpaceName={workspace.name}
          rootPage={workspace.rootPages}
          id={workspace.id}
        />
      ))}
    </SidebarGroup>
  );
}

function WorkSpaceFolder({
  workSpaceName,
  rootPage,
  id,
}: {
  workSpaceName?: string;
  rootPage: Page[];
  id: number;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const setNodeOpen = useSelectedData((state) => state.setNodeOpen);
  const createChildMutation = useMutation({
    mutationFn: createWorkSpacePageFetch,

    onSettled: async (_data, _err, variables) => {
      if (variables.parentId === null) {
        await queryClient.invalidateQueries({
          queryKey: ['initialPage', session?.user.id],
        });
      }
    },
  });
  const isOpen = useSelectedData(
    (state) => state.openMap[`workspace-${id}`] ?? false,
  );
  const handleCreateRootPage = () => {
    createChildMutation.mutate({
      workspaceID: id, // 또는 따로 workspaceId prop으로 받는 게 더 깔끔
      parentId: null,
    });
  };
  const openChange = (nextBoolean) => {
    console.log('called', nextBoolean);
    setOpen(nextBoolean);
  };
  const handleOpenChange = (ev) => {
    setOpen(!open);
  };
  const handleOpenFolder = (nextOpen: boolean) => {
    setNodeOpen(`workspace-${id}`, nextOpen);
  };
  return (
    <>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem className="w-full list-none">
            <Collapsible
              className="w-full"
              open={isOpen}
              onOpenChange={handleOpenFolder}
            >
              <div className="group/row grid w-full grid-cols-[1fr_32px_32px] items-center rounded-md hover:bg-gray-100">
                <div className="flex min-w-0 items-center">
                  <div className="flex h-8 w-5 shrink-0 items-center justify-center">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="group/trigger flex h-8 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent"
                      >
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/trigger:rotate-90" />
                      </button>
                    </CollapsibleTrigger>
                  </div>
                  <div className="px-2 flex-1 min-w-0 cursor-pointer">
                    <a className="block truncate text-sm font-medium leading-none">
                      {workSpaceName || 'My Workspace'}
                    </a>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center">
                  <button
                    onClick={handleOpenChange}
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-sidebar-accent cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex h-8 w-8 items-center justify-center">
                  <button
                    onClick={handleCreateRootPage}
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-sidebar-accent cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <CollapsibleContent>
                <SidebarMenu>
                  {rootPage.map((page) => (
                    <PageTreeNode key={page.id} page={page} depth={0} />
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
      <WorkspaceSettingsDialog
        open={open}
        onOpenChange={openChange}
      ></WorkspaceSettingsDialog>
    </>
  );
}
