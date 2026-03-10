import { NextRequest, NextResponse } from "next/server";
import { getPagePartRooms } from "@/server/users/queries";

type RouteContext = {
  params: Promise<{
    pageId?: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { pageId } = await params;
  const id = Number(pageId);

  if (!pageId || !Number.isFinite(id)) {
    return new NextResponse(null, { status: 400 });
  }
  //값 수정 해야함
  const PageRoomData = await getPagePartRooms(5, id);

  return NextResponse.json({ PageRoomData });
}
