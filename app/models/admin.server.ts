import type { Admin } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/services/db.server";
export type { Admin } from "@prisma/client";

export interface AdminData {
  email: string;
  password?: string;
  passwordConfirmation?: string;
}

export async function getAdminById(id: Admin["id"]) {
  return await prisma.admin.findUnique({ where: { id } });
}

export async function getAdmins() {
  return await prisma.admin.findMany();
}

export async function createAdmin(email: Admin["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
}

export async function updateAdmin(
  id: number,
  email: Admin["email"],
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.admin.update({
    data: {
      email,
      password: hashedPassword,
    },
    where: { id },
  });
}

export async function validateFormAdmin(email: string, password: string) {
  const adminWithPassword = await prisma.admin.findUnique({
    where: { email },
  });

  if (!adminWithPassword || !adminWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, adminWithPassword.password);

  if (!isValid) {
    return null;
  }

  // Удаляем свойство password
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...adminWithoutPassword }: Admin = adminWithPassword;

  return adminWithoutPassword;
}
