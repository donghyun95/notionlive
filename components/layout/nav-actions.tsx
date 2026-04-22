'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Trash2,
  GalleryVerticalEnd,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NotificationButton } from './informButton';
import { PublishButton } from './publish-Button';
import { useDeletePageMutation } from './tanstack-query-collection';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSelectedData } from '@/app/Providers/ClientDataProvider';
import { useQueryClient } from '@tanstack/react-query';

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const setPageNodeID = useSelectedData((state) => state.setPageNodeID);
  const userId = session?.user?.id;
  const isCurrentOpenedPage = searchParams.get('PageId') === String(pageNodeID);

  const { mutate: deletePageMutate, isPending: isDeletePending } =
    useDeletePageMutation();

  const handleDeleteCurrentPage = () => {
    if (!pageNodeID || !userId) return;

    const pageCache = queryClient.getQueryData<{
      self?: { parentId?: number | null };
    }>(['page', Number(pageNodeID)]);
    const fallbackPageId = pageCache?.self?.parentId;

    deletePageMutate(
      { pageId: Number(pageNodeID) },
      {
        onSuccess: () => {
          setIsOpen(false);

          if (!isCurrentOpenedPage) return;

          if (Number.isInteger(fallbackPageId) && fallbackPageId > 0) {
            setPageNodeID(fallbackPageId);
            router.replace(`/dashboard/${userId}?PageId=${fallbackPageId}`);
            return;
          }

          router.replace(`/dashboard/${userId}`);
        },
      },
    );
  };

  return (
    <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2 text-sm">
      <div className="flex-shrink-0">
        <NotificationButton />
      </div>
      <div className="flex-shrink-0">
        <PublishButton />
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="data-[state=open]:bg-accent h-7 w-7 flex-shrink-0"
          >
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              <SidebarGroup className="border-b last:border-none">
                <SidebarGroupContent className="gap-0">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={handleDeleteCurrentPage}
                        disabled={isDeletePending || !pageNodeID}
                      >
                        <Trash2 />
                        <span>
                          {isDeletePending ? 'Deleting...' : 'Move to Trash'}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="border-b last:border-none">
                <SidebarGroupContent className="gap-0">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <GalleryVerticalEnd /> <span>Version History</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="border-b last:border-none">
                <SidebarGroupContent className="gap-0">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FileText /> <span>Export PDF</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  );
}
