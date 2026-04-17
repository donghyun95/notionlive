import { AppSidebar } from '@/components/layout/app-sidebar';
import { NavActions } from '@/components/layout/nav-actions';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

import {
  getSidebarData,
  getChildrenPageByParentsId,
} from '@/server/users/queries';
import { NextResponse } from 'next/server';
import { getPageAncestorPath } from '@/server/create/queries';
import { Input } from '@/components/ui/input';
import { Check, Search } from 'lucide-react';
import { SelectedDataProvider } from '@/app/Providers/ClientDataProvider';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }
  const sidebarData = await getSidebarData(session?.user?.id);
  return (
    <SelectedDataProvider initialPage={sidebarData}>
      <SidebarProvider>
        <AppSidebar initialPage={sidebarData as any} />
        <SidebarInset>
          <header className="sticky top-0 z-50 grid h-14 w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-2 md:grid-cols-[1fr_minmax(0,480px)_1fr] bg-[#FAFAF5]">
            {/* 좌측: 사이드바 트리거만 남김 (모바일에서 공간 최소화) */}
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb className="min-w-0 hidden md:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      Project Management & Task Trackingasd
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex min-w-0">
              <SearchBar />
            </div>

            <div className="flex min-w-0 justify-end">
              <NavActions />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SelectedDataProvider>
  );
}
function SearchBar() {
  return (
    <div className="w-full min-w-0">
      <div className="relative group min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c605a] transition-colors" />
        <Input
          type="search"
          placeholder="Search"
          className="min-w-0 h-8 w-full rounded-md border-none bg-[#e0e4dc] pl-10 pr-4 text-sm text-[#30332e] placeholder:text-[#5c605a] shadow-none outline-none transition-all focus-visible:bg-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#4e45e4]/20 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}
