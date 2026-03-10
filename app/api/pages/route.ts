import { NextResponse } from "next/server";
import {
  getChildrenPageByParentsId,
  getWorkSpacePageByWorkSpaceId,
} from "@/server/users/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parentId = searchParams.get("parentId");
  const workSpaceId = searchParams.get("workSpaceId");
  if (parentId) {
    const page = await getChildrenPageByParentsId(Number(parentId));
    return NextResponse.json(page);
  } else if (workSpaceId) {
    const page = await getWorkSpacePageByWorkSpaceId(Number(workSpaceId));
    return NextResponse.json(page);
  } else {
    return NextResponse.json([]);
  }
}
