import type { File } from "@prisma/client";
import { prisma } from "~/services/db.server";
export type { File } from "@prisma/client";

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

export const getFiles = async (): Promise<File[]> => {
  const files = await prisma.file.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return files;
};

export const createFile = async (data: FileData) => {
  const file = await prisma.file.create({ data });
  return file;
};

export const getFileById = async (id: number) => {
  const file = await prisma.file.findUnique({
    where: { id },
  });

  return file;
};

export const updateFile = async (
  id: number,
  data: FileData | { alt: string; title: string; admin_id: number }
) => {
  const updatedFile = await prisma.file.update({
    where: { id },
    data: { ...data },
  });

  return updatedFile;
};

export async function deleteFile(id: number) {
  const deletedFile = await prisma.file.delete({
    where: { id },
  });

  return deletedFile;
}
