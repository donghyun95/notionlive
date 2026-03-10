import { randomUUID } from "crypto";

function shortUUID(length = 6) {
  return randomUUID().replace(/-/g, "").slice(0, length);
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export function createRoomId(
  type: "TEAM" | "PERSONAL",
  name: string,
  pageId: number,
): string {
  const prefix = slugify(name);
  const random = shortUUID();

  if (type === "TEAM") {
    return `team-${prefix}_${pageId}_${random}`;
  }

  return `user-${prefix}_${pageId}_${random}`;
}
