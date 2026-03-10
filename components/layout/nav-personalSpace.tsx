"use client";

import { useState } from "react";
import { ChevronRight, MoreHorizontal, Plus } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Page = {
  id: string;
  title: string;
  href?: string;
  hasChildren?: boolean;
};

type PageTreeNodeProps = {
  page: Page;
  depth: number;
};
const INDENT_SIZE = 12;
const TOGGLE_WIDTH = 20;

function PageTreeNode({ page, depth }: PageTreeNodeProps) {
  const [children, setChildren] = useState<Page[] | null>(null);
  const [loading, setLoading] = useState(false);

  const indent = depth * INDENT_SIZE;
  const childIndent = (depth + 1) * INDENT_SIZE + TOGGLE_WIDTH;
  const handleOpenChange = async (open: boolean) => {
    if (!open || loading || children !== null) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/pages?parentId=${page.id}`);
      if (!res.ok) throw new Error("Failed to fetch pages");
      const result: Page[] = await res.json();
      setChildren(result);
    } catch (error) {
      console.error("Failed to load children:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarMenuItem className="w-full list-none">
      <Collapsible className="w-full" onOpenChange={handleOpenChange}>
        <div className="group/row grid w-full grid-cols-[1fr_32px] items-center">
          <div
            className="flex min-w-0 items-center"
            style={{ paddingLeft: indent }}
          >
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

            <SidebarMenuButton asChild className="min-w-0 h-8 flex-1 pr-2">
              <a
                href={page.href ?? "#"}
                className="min-w-0 flex-1 truncate"
                title={page.title}
              >
                {page.title}
              </a>
            </SidebarMenuButton>
          </div>

          <div className="flex h-8 w-8 items-center justify-center">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-sidebar-accent cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <CollapsibleContent className="w-full">
          {loading && (
            <div
              className="px-2 py-1 text-xs text-muted-foreground"
              style={{ paddingLeft: childIndent }}
            >
              Loading...
            </div>
          )}

          {children && children.length > 0 && (
            <ul className="w-full min-w-0">
              {children.map((child) => (
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
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Personal Space</SidebarGroupLabel>

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
