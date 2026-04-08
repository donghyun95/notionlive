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
import { SelectedDataProvider } from '../Providers/ClientDataProvider';
import { getPageAncestorPath } from '@/server/create/queries';
import { Input } from '@/components/ui/input';
import { Check, Search } from 'lucide-react';
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
  // const path = await getPageAncestorPath(session?.user?.id, pageId);
  // const childrenPages = await getChildrenPageByParentsId(5);
  return (
    <SelectedDataProvider initialPage={sidebarData}>
      <SidebarProvider>
        <AppSidebar initialPage={sidebarData as any} />
        <SidebarInset>
          <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 bg-white">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      Project Management & Task Trackingasd
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <SearchBar />
            <div className="ml-auto px-3">
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
    <div className="flex-1 max-w-md mx-4">
      <div className="relative group">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
        <Input
          type="search"
          placeholder="Search"
          className="w-full h-8 pl-9 bg-stone-100 border-none focus-visible:ring-1 focus-visible:ring-stone-300 rounded-md text-sm"
        />
      </div>
    </div>
  );
}
