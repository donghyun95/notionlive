import { NextResponse } from "next/server";
import { getChildrenPageByParentsId } from "@/server/users/queries";

export async function GET(
  request: Request,
  { params }: { params: { parentId: string } },
) {
  const { searchParams } = new URL(request.url);

  const parentId = searchParams.get("parentId");
  if (parentId === "null") {
    return NextResponse.json([]);
  }
  const page = await getChildrenPageByParentsId(Number(parentId));

  return NextResponse.json(page);
}
