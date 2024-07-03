/**
 * This file contains utility functions for managing the Admin model using Prisma in a Remix application.
 * The functions include operations for fetching, creating, updating, and validating admin records.
 */
import { prisma } from '~/services/db.server';
import bcrypt from 'bcryptjs';
import type { Admin } from '@prisma/client';
export type { Admin } from '@prisma/client';

/**
 * Represents the data required to create or update an admin.
 * @interface AdminData
 */
export interface AdminData {
  email: string;
  password?: string;
  passwordConfirmation?: string;
}

/**
 * Fetches an admin by their ID.
 *
 * @param {Admin["id"]} id - The ID of the admin to fetch.
 * @returns {Promise<Admin | null>} The admin with the specified ID, or null if not found.
 */
export async function getAdminById(id: Admin['id']): Promise<Admin | null> {
  return await prisma.admin.findUnique({ where: { id } });
}

/**
 * Fetches all admins.
 *
 * @returns {Promise<Admin[]>} An array of all admins.
 */
export async function getAdmins(): Promise<Admin[]> {
  return await prisma.admin.findMany();
}

/**
 * Creates a new admin with the specified email and password.
 *
 * @param {Admin["email"]} email - The email of the new admin.
 * @param {string} password - The password of the new admin.
 * @returns {Promise<Admin>} The newly created admin.
 */
export async function createAdmin(
  email: Admin['email'],
  password: string,
): Promise<Admin> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
}

/**
 * Updates an existing admin's email and password.
 *
 * @param {number} id - The ID of the admin to update.
 * @param {Admin["email"]} email - The new email of the admin.
 * @param {string} password - The new password of the admin.
 * @returns {Promise<Admin>} The updated admin.
 */
export async function updateAdmin(
  id: number,
  email: Admin['email'],
  password: string,
): Promise<Admin> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.admin.update({
    data: {
      email,
      password: hashedPassword,
    },
    where: { id },
  });
}

/**
 * Validates an admin's email and password.
 *
 * @param {string} email - The email of the admin to validate.
 * @param {string} password - The password of the admin to validate.
 * @returns {Promise<Omit<Admin, "password"> | null>} The admin without the password if validation is successful, or null if not.
 */
export async function validateFormAdmin(
  email: string,
  password: string,
): Promise<Omit<Admin, 'password'> | null> {
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
  const { password: _, ...adminWithoutPassword } = adminWithPassword;

  return adminWithoutPassword;
}
