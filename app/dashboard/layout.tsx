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
  console.log(sidebarData);
  // const childrenPages = await getChildrenPageByParentsId(5);
  return (
    <SidebarProvider>
      <AppSidebar data={sidebarData as any} />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 bg-white">
          <div className="flex flex-1 items-center gap-2 px-3">
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
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
