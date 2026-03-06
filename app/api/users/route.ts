import { NextResponse } from "next/server";
import { getUsers, getSidebarData } from "@/server/users/queries";

export async function GET(
  request: Request,
  { params }: { params: { userId: string; parentId: string } },
) {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get("userId");

  const users = await getSidebarData(Number(userId));

  return NextResponse.json(users);
}
