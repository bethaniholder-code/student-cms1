import { NextRequest, NextResponse } from "next/server";
import { getStudent, updateStudent, deleteStudent } from "@/lib/students";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const student = await getStudent(id);
  return NextResponse.json(student);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const updated = await updateStudent(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await deleteStudent(id);
  return NextResponse.json({ success: true });
}
