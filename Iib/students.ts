// lib/students.ts
import { wixClient } from "./wixClient";

const COLLECTION = "Users";

export interface Student {
  id: string;
  fullName: string;
  emailAddress: string;
  parentEmail: string;
  phone: string;
  level: string;
  status: string;
  enrollmentDate: string;
  notes: string;
  monthlyFee: string;
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetStudentsResult {
  students: Student[];
  total: number;
  totalPages: number;
  page: number;
}

// GET all students with search + pagination
export async function getStudents({
  page = 1,
  limit = 10,
  search = "",
  status = "",
}: GetStudentsParams = {}): Promise<GetStudentsResult> {
  let query = wixClient.items.query(COLLECTION);

  if (search) {
    query = query.contains("fullName", search);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const skip = (page - 1) * limit;
  const result = await query.limit(limit).skip(skip).find();

  return {
    students: result.items.map(normalizeStudent),
    total: result.totalCount,
    totalPages: Math.ceil(result.totalCount / limit),
    page,
  };
}

// GET single student by ID
export async function getStudent(id: string): Promise<Student> {
  const result = await wixClient.items
    .query(COLLECTION)
    .eq("_id", id)
    .find();
  
  if (!result.items.length) throw new Error("Student not found");
  return normalizeStudent(result.items[0]);
}

// CREATE student
export async function createStudent(data: Omit<Student, "id">): Promise<Student> {
  const result = await wixClient.items.insert(COLLECTION, toWixFormat(data));
  return normalizeStudent(result);
}

// UPDATE student
export async function updateStudent(id: string, data: Omit<Student, "id">): Promise<Student> {
  const result = await wixClient.items.update(COLLECTION, {
    _id: id,
    ...toWixFormat(data),
  });
  return normalizeStudent(result);
}

// DELETE student
export async function deleteStudent(id: string): Promise<void> {
  await wixClient.items.remove(COLLECTION, id);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeStudent(item: any): Student {
  return {
    id:             item._id          || "",
    fullName:       item.fullName     || "",
    emailAddress:   item.emailAddress || "",
    parentEmail:    item.parentEmail  || "",
    phone:          item.phone        || "",
    level:          item.level        || "Beginner",
    status:         item.status       || "Active",
    enrollmentDate: item.enrollmentDate || "",
    notes:          item.notes        || "",
    monthlyFee:     item.monthlyFee   || "",
  };
}

function toWixFormat(data: Omit<Student, "id">) {
  return {
    fullName:       data.fullName,
    emailAddress:   data.emailAddress,
    parentEmail:    data.parentEmail,
    phone:          data.phone,
    level:          data.level,
    status:         data.status,
    enrollmentDate: data.enrollmentDate,
    notes:          data.notes,
    monthlyFee:     data.monthlyFee,
  };
}