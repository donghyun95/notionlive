import { WorkspaceMemberRole } from '@/lib/api/getWorkSpaceMemberRoleFetch';
import { addMemberFetch } from '@/lib/api/invite/iviteaddmemberFetch';
import { renameWorkspaceFetch } from '@/lib/api/renameWorkspaceFetch';
import { searchUserFetch } from '@/lib/api/search/searchuserFetch';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { PendingInvitesfetch } from '@/lib/api/invite/pendingInviteFetch';
import { acceptRejectFetch } from '@/lib/api/invite/acceptRejectFetch';
import { WorkspaceMembersfetch } from '@/lib/api/getWorkspaceMemeberFetch';
import { removeWorkspaceMemberFetch } from '@/lib/api/removeWorkspaceMemberFetch';
import { deleteWorkspaceFetch } from '@/lib/api/deleteWorkspaceFetch';
import { updateWorkspaceMemberRoleFetch } from '@/lib/api/updateWorkspaceMemberRoleFetch';
import { getPersonalDeletedPagesFetch } from '@/lib/api/getPersonalDeletedPagesFetch';
import { softDeletePageWithDescendantsFetch } from '@/lib/api/softDeletePageWithDescendantsFetch';
import { hardDeletePageFetch } from '@/lib/api/hardDeletePageFetch';
import { restorePageFetch } from '@/lib/api/restorePageFetch';
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
        queryKey: ['initialPage'],
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

type InviteActionType = 'ACCEPT' | 'DECLINE';

interface InviteActionParams {
  inviteId: string;
  type: InviteActionType;
}

export function useInviteActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: InviteActionParams) => acceptRejectFetch(params),

    onSuccess: (data, variables) => {
      // 필요한 쿼리 invalidate
      queryClient.invalidateQueries({
        queryKey: ['pendingInvites'],
      });
      queryClient.invalidateQueries({
        queryKey: ['initialPage'],
      });
      toast.success('Success', {
        position: 'top-center',
      });
    },

    onError: (error) => {
      toast?.error?.('A server error occurred. Please try again later', {
        position: 'top-center',
      });
    },
  });
}

export function useWorkspaceMembers(workspaceId: number) {
  return useQuery({
    queryKey: ['workspaceMembers', workspaceId],
    queryFn: () => WorkspaceMembersfetch(workspaceId),
    enabled: !!workspaceId, // workspaceId 있을 때만 실행
  });
}

type RemoveWorkspaceMemberVariables = {
  workspaceId: number;
  userId: string;
};

export function useRemoveWorkspaceMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: RemoveWorkspaceMemberVariables) =>
      removeWorkspaceMemberFetch({ workspaceId, userId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaceMembers', variables.workspaceId],
      });
      toast.success('Member removed', {
        position: 'top-center',
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : '멤버 삭제에 실패했습니다.';

      toast.error(errorMessage, {
        position: 'top-center',
      });
    },
  });
}

type DeleteWorkspaceVariables = {
  workspaceId: number;
};

type UpdateWorkspaceMemberRoleVariables = {
  workspaceId: number;
  userId: string;
  role: 'OWNER' | 'MEMBER';
};

export function useDeleteWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId }: DeleteWorkspaceVariables) =>
      deleteWorkspaceFetch(workspaceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['initialPage'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaceMembers', variables.workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });

      toast.success('Workspace deleted', {
        position: 'top-center',
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete workspace.';

      toast.error(errorMessage, {
        position: 'top-center',
      });
    },
  });
}

export function useUpdateWorkspaceMemberRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      userId,
      role,
    }: UpdateWorkspaceMemberRoleVariables) =>
      updateWorkspaceMemberRoleFetch({ workspaceId, userId, role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaceMembers', variables.workspaceId],
      });
      toast.success('Member role updated', {
        position: 'top-center',
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '멤버 권한 수정에 실패했습니다.';

      toast.error(errorMessage, {
        position: 'top-center',
      });
    },
  });
}

export function usePersonalDeletedPages() {
  return useQuery({
    queryKey: ['personalDeletedPages'],
    queryFn: getPersonalDeletedPagesFetch,
  });
}

type SoftDeletePageVariables = {
  pageId: number;
};

export function useSoftDeletePageWithDescendantsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId }: SoftDeletePageVariables) =>
      softDeletePageWithDescendantsFetch(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['initialPage'],
      });
      queryClient.invalidateQueries({
        queryKey: ['personalDeletedPages'],
      });

      toast.success('Page deleted', {
        position: 'top-center',
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : '페이지 삭제에 실패했습니다.';

      toast.error(errorMessage, {
        position: 'top-center',
      });
    },
  });
}

type HardDeletePageVariables = {
  pageId: number;
  type?: 'personal';
};
export function useHardDeletePageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, type }: HardDeletePageVariables) => {
      console.log(type, 'type in useHardDeletePageMutation');
      return hardDeletePageFetch(pageId, type);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['personalDeletedPages'],
      });

      queryClient.invalidateQueries({
        queryKey: ['initialPage'],
      });

      toast.success('Page permanently deleted', {
        position: 'top-center',
      });
    },

    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '페이지 영구 삭제에 실패했습니다.';

      toast.error(errorMessage, {
        position: 'top-center',
      });
    },
  });
}

type RestorePageVariables = {
  pageId: number;
};

export function useRestorePageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId }: RestorePageVariables) => restorePageFetch(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['personalDeletedPages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['initialPage'],
      });

      toast.success('Page restored', {
        position: 'top-center',
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : '페이지 복원에 실패했습니다.';

      toast.error(errorMessage, {
        position: 'top-center',
      });
    },
  });
}
