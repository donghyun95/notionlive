import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  FileText,
  Star,
  Trash2,
  Inbox,
  CircleQuestionMark,
} from 'lucide-react';
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
  onOpenTrashPage?: () => void;
  onEmptyTrash?: () => void;
};

export function SidebarBottomUtiltiy({
  onOpenTrashPage,
  onEmptyTrash,
}: SidebarBottomUtilityProps) {
  return (
    <div className="space-y-1 py-2 px-2">
      {/* <Button
        className="
    w-full mb-2 py-2.5 px-4 
    bg-gradient-to-br from-[#4e45e4] to-[#4135d8]
    text-white rounded-xl font-semibold text-sm
    shadow-sm
    hover:shadow-md
    hover:brightness-110
    active:scale-[0.98]
    transition-all duration-200
  "
      >
        <span className="text-sm">New Page</span>
        <Plus className="h-4 w-4" />
      </Button> */}

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trash</DialogTitle>
            <DialogDescription>
              삭제된 페이지를 확인하거나 복구할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={onOpenTrashPage}>휴지통 보기</Button>
            <Button variant="destructive" onClick={onEmptyTrash}>
              비우기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
