import { NextResponse } from "next/server";
import { authenticator } from "@/lib/security/totp";
import QRCode from "qrcode";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { setPendingMfaSecret } from "@/lib/database/users";

export async function POST(request: Request) {
  const { user, error } = await authorizeAndValidate({
    permission: "self",
    request,
  });

  if (error) return error;

  const secret = authenticator.generateSecret();
  await setPendingMfaSecret(user.id, secret);

  const otpauthUrl = authenticator.keyuri(user.email, "URUU", secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return NextResponse.json({ secret, qrCodeDataUrl });
}
