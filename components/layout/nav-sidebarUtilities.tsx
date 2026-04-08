import { Button } from '@/components/ui/button';
import { Plus, FileText, Star, Trash2 } from 'lucide-react';

export function SidebarUtilities() {
  return (
    <div className="space-y-1 py-2 px-2">
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-stone-600 hover:bg-stone-200/50 h-8 px-2"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">New Page</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-stone-600 hover:bg-stone-200/50 h-8 px-2"
      >
        <Star className="h-4 w-4" />
        <span className="text-sm">Favorites</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-stone-600 hover:bg-stone-200/50 h-8 px-2"
      >
        <Trash2 className="h-4 w-4" />
        <span className="text-sm">Trash</span>
      </Button>
    </div>
  );
}
