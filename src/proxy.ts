import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers as nextHeaders } from "next/headers";

export async function proxy(request: NextRequest) {
  // Parse session
  const session = await auth.api.getSession({
    headers: await nextHeaders(),
  });

  // Block request early if no session
  if (!session) {
    return new NextResponse(JSON.stringify({
      error: "Unauthorized",
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Attach user ID to headers for API usage
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.user.id);

  // Continue request with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/api/tasks/:path*", // ONLY protect API
  ],
};