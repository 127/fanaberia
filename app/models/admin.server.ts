import type { Admin } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/services/db.server";
export type { Admin } from "@prisma/client";

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

  // Добавляем свойство isAdmin
  // return { ...adminWithoutPassword, isAdmin: true };

  return adminWithoutPassword;
}
