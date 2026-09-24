import { NextRequest, NextResponse } from "next/server";
import { wordpressService } from "@/services/wordpressService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "6", 10);
  const typeParam = searchParams.get("type");
  const type = (typeParam === "newsletter" || typeParam === "blogs" || typeParam === "all")
    ? typeParam
    : "blogs";
  const search = searchParams.get("search") || undefined;

  try {
    const result = await wordpressService.getPosts({
      page,
      perPage,
      type,
      search,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/blogs error:", error);
    return NextResponse.json(
      {
        posts: [],
        total: 0,
        totalPages: 0,
        hasMore: false,
        page,
        error: error?.message || "Failed to fetch posts",
      },
      { status: 500 }
    );
  }
}
