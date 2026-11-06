import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export { POST } from "../prismic/webhook/route";

export async function GET() {
  revalidateTag("prismic");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
