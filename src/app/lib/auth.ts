import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "Authorization";
export const ADMIN_PREVIEW_COOKIE = "AdminPreview";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido no .env");
}

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

type JwtPayload = {
  userId?: string;
  sub?: string; // às vezes o userId vem no "sub"
  email?: string;
  name?: string;
  adminPreview?: boolean;
};

export async function getSessionUser() {
  const cookieStore = cookies();
  const previewCookie = cookieStore.get(ADMIN_PREVIEW_COOKIE)?.value;
  const cookie = previewCookie ?? cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, getSecretKey());
    const p = payload as unknown as JwtPayload;

    const userId = p.userId ?? p.sub;
    if (!userId) return null;

    return {
      userId: String(userId),
      email: p.email ? String(p.email) : undefined,
      name: p.name ? String(p.name) : undefined,
      adminPreview: p.adminPreview === true,
    };
  } catch {
    return null;
  }
}
