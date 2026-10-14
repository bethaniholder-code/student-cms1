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
  paymentStatus: string;
}

export async function getStudents({ page = 1, limit = 50, search = "", status = "" } = {}) {
  let query = wixClient.items.query(COLLECTION);
  if (search) query = query.contains("fullName", search);
  if (status) query = query.eq("status", status);
  const result = await query.limit(limit).skip((page - 1) * limit).find();
  const total = result.items.length;
  return {
    students: result.items.map(normalizeStudent),
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

export async function getStudent(id: string) {
  const result = await wixClient.items.query(COLLECTION).eq("_id", id).find();
  if (!result.items.length) throw new Error("Student not found");
  return normalizeStudent(result.items[0]);
}

export async function createStudent(data: Omit<Student, "id">) {
  const result = await wixClient.items.insert(COLLECTION, toWixFormat(data));
  return normalizeStudent(result);
}

export async function updateStudent(id: string, data: Omit<Student, "id">) {
  const result = await wixClient.items.update(COLLECTION, { _id: id, ...toWixFormat(data) });
  return normalizeStudent(result);
}

export async function togglePayment(id: string, currentStatus: string) {
  const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
  
  // First get the full student data
  const existing = await wixClient.items.query(COLLECTION).eq("_id", id).find();
  if (!existing.items.length) throw new Error("Student not found");
  
  const student = existing.items[0];
  
  // Update with ALL existing fields + new payment status
  const result = await wixClient.items.update(COLLECTION, {
    _id: id,
    fullName:       student.fullName,
    emailAddress:   student.emailAddress,
    parentEmail:    student.parentEmail,
    phone:          student.phone,
    level:          student.level,
    status:         student.status,
    enrollmentDate: student.enrollmentDate,
    notes:          student.notes,
    monthlyFee:     student.monthlyFee,
    paymentStatus:  newStatus,
  });
  
  return normalizeStudent(result);
}

export async function deleteStudent(id: string) {
  await wixClient.items.remove(COLLECTION, id);
}

function normalizeStudent(item: any): Student {
  return {
    id:             item._id            || "",
    fullName:       item.fullName       || "",
    emailAddress:   item.emailAddress   || "",
    parentEmail:    item.parentEmail    || "",
    phone:          item.phone          || "",
    level:          item.level          || "Beginner",
    status:         item.status         || "Active",
    enrollmentDate: item.enrollmentDate || "",
    notes:          item.notes          || "",
    monthlyFee:     item.monthlyFee     || "",
    paymentStatus:  item.paymentStatus  || "Unpaid",
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
    paymentStatus:  data.paymentStatus,
  };
}