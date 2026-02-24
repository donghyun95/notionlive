import { Room } from "./Room";
import { Editor } from "./Editor";
import { Cursor } from "./Cursor";
export default function Page() {
  return (
    <Room>
      <Cursor />
      <Editor />
    </Room>
  );
}
