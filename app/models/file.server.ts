/**
 * This file contains functions for interacting with the File entity in the database.
 * It includes functions to create, read, update, and delete files.
 */
import type { File } from "@prisma/client";
import { prisma } from "~/services/db.server";
export type { File } from "@prisma/client";

/**
 * Interface representing the data structure for a file.
 * @interface FileData
 */
interface FileData {
  name: string;
  alt: string;
  title: string;
  path: string;
  mime_type: string;
  size: number;
  admin_id: number;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Retrieves all files from the database, ordered by descending ID.
 *
 * @returns {Promise<File[]>} A promise that resolves to an array of File objects.
 */
export const getFiles = async (): Promise<File[]> => {
  const files = await prisma.file.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return files;
};

/**
 * Creates a new file in the database.
 *
 * @param {FileData} data - The data for the new file.
 * @returns {Promise<File>} A promise that resolves to the created File object.
 */
export const createFile = async (data: FileData): Promise<File> => {
  const file = await prisma.file.create({ data });
  return file;
};

/**
 * Retrieves a file by its ID.
 *
 * @param {number} id - The ID of the file to retrieve.
 * @returns {Promise<File | null>} A promise that resolves to the File object if found, or null if not.
 */
export const getFileById = async (id: number): Promise<File | null> => {
  const file = await prisma.file.findUnique({
    where: { id },
  });

  return file;
};

/**
 * Updates a file with the given ID.
 *
 * @param {number} id - The ID of the file to update.
 * @param {FileData | { alt: string; title: string; admin_id: number }} data - The data to update the file with.
 * @returns {Promise<File>} A promise that resolves to the updated File object.
 */
export const updateFile = async (
  id: number,
  data: FileData | { alt: string; title: string; admin_id: number }
): Promise<File> => {
  const updatedFile = await prisma.file.update({
    where: { id },
    data: { ...data },
  });

  return updatedFile;
};

/**
 * Deletes a file by its ID.
 *
 * @param {number} id - The ID of the file to delete.
 * @returns {Promise<File>} A promise that resolves to the deleted File object.
 */
export const deleteFile = async (id: number): Promise<File> => {
  const deletedFile = await prisma.file.delete({
    where: { id },
  });

  return deletedFile;
};
