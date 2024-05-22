import { redirect } from "@remix-run/react";
import invariant from "tiny-invariant";
import { isIP } from "is-ip";
import postmark from "postmark";
import * as fs from "fs";
import { authenticator } from "~/services/auth.server";
import {
  AUTHORIZED_USER_INDEX,
  AUTHENTICATION_FAILURE_PATHS,
  AUTHORIZED_ADMIN_INDEX,
} from "./utils.common";
import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";

export type ResponseError = {
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  errors?: {
    message?: string;
    email?: string;
    password?: string;
    passwordConfirmation?: string;
    terms?: string;
  };
};

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export const safeRedirect = (
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = AUTHORIZED_USER_INDEX
) => {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
};

export const generateToken = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const sendEmail = async (
  To: string,
  Subject: string,
  HtmlBody: string
) => {
  invariant(process.env.POSTMARK_API_KEY, "POSTMARK_API_KEY must be set");
  invariant(process.env.CONTACT_FORM_EMAIL, "CONTACT_FORM_EMAIL must be set");
  const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

  await client.sendEmail({
    From: process.env.CONTACT_FORM_EMAIL,
    To,
    Subject,
    HtmlBody,
  });
};

const headerNames = Object.freeze([
  "X-Client-IP",
  "X-Forwarded-For",
  "HTTP-X-Forwarded-For",
  "Fly-Client-IP",
  "CF-Connecting-IP",
  "Fastly-Client-Ip",
  "True-Client-Ip",
  "X-Real-IP",
  "X-Cluster-Client-IP",
  "X-Forwarded",
  "Forwarded-For",
  "Forwarded",
  "DO-Connecting-IP" /** Digital ocean app platform */,
  "oxygen-buyer-ip" /** Shopify oxygen platform */,
] as const);

export const getClientIPAddress = (r: Request): string | null => {
  const headers = r.headers;
  const ipAddress = headerNames
    .flatMap((headerName) => {
      const value = headers.get(headerName);
      if (headerName === "Forwarded") {
        return parseForwardedHeader(value);
      }
      if (!value?.includes(",")) return value;
      return value.split(",").map((ip) => ip.trim());
    })
    .find((ip) => {
      if (ip === null) return false;
      return isIP(ip);
    });

  return ipAddress ?? null;
};

const parseForwardedHeader = (value: string | null): string | null => {
  if (!value) return null;
  for (const part of value.split(";")) {
    if (part.startsWith("for=")) return part.slice(4);
    continue;
  }
  return null;
};

export const authenticateUserByRole = async (
  request: Request,
  role: "user" | "admin"
) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: AUTHENTICATION_FAILURE_PATHS[role],
  });

  // Перенаправление уже выполнено функцией isAuthenticated
  if (!user) {
    throw redirect(AUTHENTICATION_FAILURE_PATHS[role]);
  }

  const isAdmin: boolean = !("sign_in_count" in user);
  if (!isAdmin && role === "admin") {
    throw redirect(AUTHORIZED_USER_INDEX);
  }
  if (isAdmin && role === "user") {
    throw redirect(AUTHORIZED_ADMIN_INDEX);
  }
  return user;
};

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB in bytes

invariant(process.env.FILES_STORAGE_PATH, "FILES_STORAGE_PATH must be set");
export const uploadHandler = unstable_composeUploadHandlers(
  unstable_createFileUploadHandler({
    directory: process.env.FILES_STORAGE_PATH,
    maxPartSize: MAX_FILE_SIZE,
    file: ({ filename }: { filename: string }) => filename,
  }),
  // parse everything else into memory
  unstable_createMemoryUploadHandler()
);

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.promises.access(filePath);
    return true; // Файл существует
  } catch {
    return false; // Файл не существует
  }
};

/**
 * Validates the reCAPTCHA value using the Google reCAPTCHA API.
 *
 * Ensures that the reCAPTCHA site key is set and skips validation if the application is not running in production.
 *
 * @param {FormDataEntryValue | null} recaptchaValue - The reCAPTCHA value obtained from the form.
 * @returns {Promise<Object>} An object containing the reCAPTCHA verification result. If not in production, returns an object with `success: true`.
 * @throws Will throw an error if `RECAPTCHA_SITE_KEY` is not set in the environment variables.
 */
export const validateCaptcha = async (
  recaptchaValue: FormDataEntryValue | null
) => {
  invariant(process.env.RECAPTCHA_SITE_KEY, "RECAPTCHA_SITE_KEY must be set");

  if (process.env.NODE_ENV !== "production") return { success: true };

  const captchaResponse = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaValue}`,
    }
  );

  return await captchaResponse.json();
};
