import { WorkspaceMemberRole } from '@/lib/api/getWorkSpaceMemberRoleFetch';
import { addMemberFetch } from '@/lib/api/invite/iviteaddmemberFetch';
import { renameWorkspaceFetch } from '@/lib/api/renameWorkspaceFetch';
import { searchUserFetch } from '@/lib/api/search/searchuserFetch';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { PendingInvitesfetch } from '@/lib/api/invite/pendingInviteFetch';

type InviteRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export const addMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMemberFetch,

    onSuccess: (_, variables) => {
      //쿼리키 수정필요 // serchuser는수정필요없을거같고 ,
      // queryClient.invalidateQueries({
      //   queryKey: ['workspace-members', variables.workspaceId],
      // });

      // queryClient.invalidateQueries({
      //   queryKey: ['workspace-invites', variables.workspaceId],
      // });
      queryClient.invalidateQueries({
        queryKey: ['searchUsers'],
      });
    },
  });
};

export function useSearchUsers(keyword: string, workspaceId: number) {
  return useQuery({
    queryKey: ['searchUsers', keyword],
    queryFn: () => searchUserFetch(keyword, workspaceId),
    enabled: !!keyword && keyword.trim().length >= 3, // keyword 없으면 아예 실행 안함
    staleTime: 0,
  });
}

export function useWorkspaceMemberRole(workspaceId: number, userId: string) {
  return useQuery({
    queryKey: ['workspaceRole', workspaceId, userId],
    queryFn: () => WorkspaceMemberRole(workspaceId, userId),
    enabled: !!workspaceId && !!userId,
  });
}

type RenameWorkspaceVariables = {
  workspaceId: number;
  name: string;
  userId: string;
};
export function useRenameWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, name, userId }: RenameWorkspaceVariables) =>
      renameWorkspaceFetch(workspaceId, name),

    onSuccess: (_, variables) => {
      toast.success('Success', {
        position: 'top-center',
      });
      queryClient.invalidateQueries({
        queryKey: ['initialPage', variables.userId],
      });
      // queryClient.invalidateQueries({
      //   queryKey: ['workspaces'],
      // });
    },
    onError: () => {
      console.log('실패');
      toast?.error?.('Failed WorkSpace Renaming', {
        position: 'top-center',
      });
    },
  });
}

export function usePendingInvites(userId: string) {
  return useQuery({
    queryKey: ['pendingInvites', userId],
    queryFn: () => PendingInvitesfetch(userId),
    enabled: !!userId, // userId 없으면 실행 안 함
  });
}
