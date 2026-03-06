"use client";

import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  StarOff,
  Trash2,
  ChevronRight,
  Plus,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useEffect, useState } from "react";

async function fetchChildPages(parentId: string) {
  const res = await fetch(`/api/pages?parentId=${parentId}`);
  if (!res.ok) throw new Error("Failed to fetch pages");
  return res.json();
}

function MakePageComponent({ pages }: any) {
  const [childrenById, setChildrenById] = useState<Record<string, any[]>>({});

  return pages.map((page: any) => (
    <SidebarMenuItem key={page.id}>
      <Collapsible
        onOpenChange={async (isOpen) => {
          if (isOpen) {
            const childPages = await fetchChildPages(page.id);
            setChildrenById((prev) => ({ ...prev, [page.id]: childPages }));
          }
        }}
      >
        <SidebarMenuButton asChild>
          <a href="#">
            {/* url 연결 필요*/}
            <span className="w-4" />
            <span>{page.title}</span>
          </a>
        </SidebarMenuButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction
            className="bg-sidebar-accent text-sidebar-accent-foreground left-2 data-[state=open]:rotate-90"
            showOnHover
          >
            <ChevronRight />
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <SidebarMenuAction showOnHover>
          <Plus />
        </SidebarMenuAction>
        <CollapsibleContent>
          <SidebarMenuSub>
            {childrenById[page.id] && (
              <MakePageComponent pages={childrenById[page.id]} />
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  ));
}

export function NavPersonalSpace({ pages }: any) {
  const { isMobile } = useSidebar();
  console.log("NavPersonalSpace props:", { pages });
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Personal Space</SidebarGroupLabel>
      <SidebarMenu>
        <MakePageComponent pages={pages}></MakePageComponent>
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
