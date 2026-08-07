import { NextRequest, NextResponse } from "next/server";
import { getStudents, createStudent } from "@/lib/students";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const data = await getStudents({ page, limit, search, status });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const created = await createStudent(body);
  return NextResponse.json(created, { status: 201 });
}
