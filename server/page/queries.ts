import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
export const getPagePublicInfo = async (pageId: number) => {
  return await prisma.page.findFirst({
    where: { id: pageId, deletedAt: null },
  });
};

export const togglePublishPage = async (pageId: number) => {
  const page = await getPagePublicInfo(pageId);

  if (!page) {
    throw new Error('페이지 없음');
  }

  const nextIsPublished = !page.ispublished;
  const nextPublicToken = page.publictoken ?? randomUUID();

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: {
      ispublished: nextIsPublished,
      publictoken: nextPublicToken,
    },
    select: {
      id: true,
      ispublished: true,
      publictoken: true,
    },
  });
  return updated;
};
export const findPageByPublicToken = async (token: string) => {
  const page = await prisma.page.findFirst({
    where: {
      publictoken: token,
      deletedAt: null,
    },
  });
  if (!page) {
    throw new Error('페이지 없음');
  }
  return page;
};
