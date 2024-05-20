import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/services/db.server";
import { generateToken } from "../utils/utils.server";

export type { User } from "@prisma/client";

export interface UserData {
  email: string;
  password?: string;
  passwordConfirmation?: string;
  terms?: string;
}

export async function userExists(email: User["email"]) {
  return prisma.user.count({ where: { email } }).then(Boolean);
}

// allow only to confirmed users
export async function userExistsAndPasswordIsRecoverable(email: User["email"]) {
  return prisma.user
    .count({ where: { email, confirmation_token: null } })
    .then(Boolean);
}

// allow only to confirmed users
export async function setPasswordRecoveryToken(email: User["email"]) {
  const token: string = generateToken(20);
  await prisma.user.update({
    data: {
      reset_password_sent_at: new Date(),
      reset_password_token: token,
    },
    where: { email },
  });
  return token;
}

// if user is also unconfirmed do not allow to recover password
export async function userIsRecovering(
  reset_password_token: User["reset_password_token"]
) {
  return await prisma.user
    .count({
      where: {
        reset_password_token,
        reset_password_sent_at: { not: null },
        confirmation_token: null,
      },
    })
    .then(Boolean);
}

export async function resetPassword(
  reset_password_token: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    data: {
      reset_password_sent_at: null,
      reset_password_token: null,
      password: hashedPassword,
      updated_at: new Date(),
    },
    where: { reset_password_token },
  });
}

export async function getUsers() {
  return await prisma.user.findMany();
}

export async function getUserById(id: User["id"]) {
  return await prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return await prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  email: User["email"],
  password: string,
  current_sign_in_ip: string | null
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      confirmation_token: generateToken(64),
      current_sign_in_ip,
    },
  });
}

// always returns true on already confirmed users
export async function confirmUser(confirmation_token: string) {
  if (!confirmation_token || confirmation_token.length == 0) return false;

  const isUser: boolean = await prisma.user
    .count({ where: { confirmation_token } })
    .then(Boolean);
  if (!isUser) return false;

  const updatedRecord = await prisma.user.update({
    data: {
      confirmed_at: new Date(),
      confirmation_token: null,
    },
    where: { confirmation_token },
  });

  return updatedRecord.confirmed_at ? true : false;
}

export async function deleteUserByEmail(email: User["email"]) {
  return await prisma.user.delete({ where: { email } });
}

export async function findOrCreateOauthUser(
  email: string,
  provider: string,
  current_ip: string
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (user) {
    // if user is not confirmed but decided to go through oauth
    if (user.confirmation_token !== null) {
      await confirmUser(user.confirmation_token);
    }

    await touchUserOnSignIn(
      user.id,
      user.current_sign_in_at,
      user.current_sign_in_ip,
      current_ip
    );
    return user;
  }

  return await prisma.user.create({
    data: {
      email,
      password: provider + generateToken(10),
      confirmation_token: null,
      confirmed_at: new Date(),
    },
  });
}

export async function touchUserOnSignIn(
  id: number,
  last_sign_in_at: Date | null,
  last_sign_in_ip: string | null,
  current_sign_in_ip: string | null
) {
  // reset trials counter [sign_in_count]
  await prisma.user.update({
    data: {
      last_sign_in_ip,
      current_sign_in_ip,
      current_sign_in_at: new Date(),
      last_sign_in_at: last_sign_in_at ?? new Date(),
      sign_in_count: 0,
      reset_password_sent_at: null,
      reset_password_token: null,
    },
    where: { id },
  });
}

export async function validateFormUser(
  email: string,
  password: string,
  current_ip: string
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password);

  if (!isValid) {
    // increment trials counter
    await prisma.user.update({
      data: { sign_in_count: userWithPassword.sign_in_count + 1 },
      where: { id: userWithPassword.id },
    });
    return null;
  }
  // also reset trials counter
  await touchUserOnSignIn(
    userWithPassword.id,
    userWithPassword.current_sign_in_at,
    userWithPassword.current_sign_in_ip, //send to last_sign_in_ip
    current_ip
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword }: User = userWithPassword;

  return userWithoutPassword;
}
