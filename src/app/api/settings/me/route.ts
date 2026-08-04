import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getUserProfile } from "@/lib/database/users";

export async function GET(request: Request) {
  const { user, error } = await authorizeAndValidate({
    permission: "self",
    request,
  });

  if (error) return error;

  const profile = await getUserProfile(user.id);
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
