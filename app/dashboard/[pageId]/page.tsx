import { Room } from '../../Room';
import { Editor } from '../../Editor';
import { getPagePartRooms } from '@/server/users/queries';
import { EditorWrapper } from '@/app/EditorwWrapper';

import { TitleInput } from '@/app/TitleInput';
import { EditorProvider } from '@/app/EditorProvider';

type Props = {
  params: {
    pageId: string;
  };
};

export default async function Page({ params }: Props) {
  const { pageId } = await params;
  const id = Number(pageId);
  if (!pageId || !Number.isFinite(id)) {
    return <div>데이터가없습니다.</div>;
  }
  //값 수정 해야함 , session.uerId

  const PageRoomData = await getPagePartRooms(2, id);
  console.log('pageRoom Dash', PageRoomData);
  return (
    <Room data={PageRoomData}>
      <EditorProvider>
        <EditorWrapper>
          <TitleInput />
          <Editor />
        </EditorWrapper>
      </EditorProvider>
    </Room>
  );
}
