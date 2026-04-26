import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ReactNode } from 'react';
import {
  CircleQuestionMark,
  FileText,
  Inbox,
  Star,
  Trash2,
} from 'lucide-react';

type DeletedPage = {
  id: string;
  title: string;
  icon?: ReactNode;
};

type DeletePageParams = {
  pageId: number;
  type?: 'personal';
};

type DeletedPageRowProps = {
  page: DeletedPage;
  onRestorePage: (id: string) => void;
  onDeletePage: (params: DeletePageParams) => void;
};

function DeletedPageRow({
  page,
  onRestorePage,
  onDeletePage,
}: DeletedPageRowProps) {
  return (
    <div className="flex h-12 w-full items-center justify-between rounded-lg border border-[#d9ddd3] px-3 transition-colors duration-200 hover:bg-[#f4f5f1]">
      <div className="mr-3 flex min-w-0 items-center gap-2 text-[#5c605a]">
        <span className="shrink-0">
          {page.icon ?? <FileText className="h-4 w-4" />}
        </span>
        <span className="truncate text-sm font-medium" title={page.title}>
          {page.title}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[#5c605a] transition-colors duration-200 hover:bg-[#e7e9e2]"
          aria-label={`복원: ${page.title}`}
          onClick={() => onRestorePage(page.id)}
        >
          복원
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
          aria-label={`영구 삭제: ${page.title}`}
          onClick={() =>
            onDeletePage({
              pageId: Number(page.id),
              type: 'personal',
            })
          }
        >
          삭제
        </Button>
      </div>
    </div>
  );
}

type DeletedPageListProps = {
  pages: DeletedPage[];
  onRestorePage: (id: string) => void;
  onDeletePage: (variable: DeletePageParams) => void;
};

function DeletedPageList({
  pages,
  onRestorePage,
  onDeletePage,
}: DeletedPageListProps) {
  console.log(onDeletePage, 'onDeletePage in DeletedPageList');
  if (pages.length === 0) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center text-center text-[#5c605a]">
        <p className="font-headline text-sm font-semibold">
          휴지통이 비어 있습니다.
        </p>
        <p className="mt-1 text-xs text-[#7b8078]">
          삭제된 페이지가 생기면 이곳에서 복원하거나 영구 삭제할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pages.map((page) => (
        <DeletedPageRow
          key={page.id}
          page={page}
          onRestorePage={onRestorePage}
          onDeletePage={onDeletePage}
        />
      ))}
    </div>
  );
}
const utilityItemClass = `
  w-full justify-start gap-3
  px-3 py-2 h-auto
  rounded-lg
  text-[#5c605a]
  font-headline text-sm font-medium tracking-tight
  hover:bg-[#e7e9e2] hover:text-[#5c605a]
  active:scale-[0.98]
  transition-colors duration-200
`;
export function SidebarTopUtilities() {
  return (
    <div className="space-y-1 py-2 px-2">
      <Button variant="ghost" className={utilityItemClass}>
        <Star className="w-5 h-5" />
        <span>Favorites</span>
      </Button>

      <Button variant="ghost" className={utilityItemClass}>
        <Inbox className="w-5 h-5" />
        <span className="text-sm">Inbox</span>
      </Button>
    </div>
  );
}

type SidebarBottomUtilityProps = {
  deletePage?: Array<{
    id: number | string;
    title: string | null;
  }>;
  onOpenTrashPage?: () => void;
  onEmptyTrash?: () => void;
  onRestorePage: (id: string) => void;
  onDeletePage: (variable: DeletePageParams) => void;
};

export function SidebarBottomUtiltiy({
  deletePage,
  onEmptyTrash,
  onRestorePage,
  onDeletePage,
}: SidebarBottomUtilityProps) {
  const mappedDeletedPages: DeletedPage[] =
    deletePage?.map((page) => ({
      id: String(page.id),
      title: page.title ?? 'Untitled',
      icon: <FileText className="h-4 w-4" />,
    })) ?? [];
  console.log(onDeletePage, 'onDeletePage in SidebarBottomUtility22');
  return (
    <div className="space-y-1 py-2 px-2">
      <Button variant="ghost" className={utilityItemClass}>
        <CircleQuestionMark className="w-5 h-5" />
        <span>Help</span>
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className={utilityItemClass}>
            <Trash2 className="w-5 h-5" />
            <span>Trash</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-[40vw] min-h-[40vh] overflow-hidden border border-zinc-200 bg-white p-0 text-black shadow-2xl sm:max-w-[460px] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Trash</DialogTitle>
            <DialogDescription>
              삭제된 페이지를 확인하거나 복구할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 max-h-[300px] space-y-2 overflow-y-auto px-4 pb-2">
            <DeletedPageList
              pages={mappedDeletedPages}
              onRestorePage={onRestorePage}
              onDeletePage={onDeletePage}
            />
          </div>
          <DialogFooter className="px-4 pb-4">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
