/**
 * This file contains various utility functions for managing users in the system.
 * It includes functions for creating, updating, and retrieving user data, as well as
 * handling user authentication and password recovery processes.
 */
import { generateToken } from '../utils/utils.server';
import { prisma } from '~/services/db.server';
import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';

export type { User } from '@prisma/client';

/**
 * Interface for user data input, used for user-related operations.
 * @interface UserData
 */
export interface UserData {
  email: string;
  password?: string;
  passwordConfirmation?: string;
  terms?: string;
}

/**
 * Check if a user with the given email exists.
 *
 * @param {string} email - The email of the user to check.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user exists.
 */
export const userExists = async (email: User['email']): Promise<boolean> => {
  return prisma.user.count({ where: { email } }).then(Boolean);
};

/**
 * Check if a user with the given email exists and their password is recoverable.
 *
 * @param {string} email - The email of the user to check.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user exists and their password is recoverable.
 */
export const userExistsAndPasswordIsRecoverable = async (
  email: User['email'],
): Promise<boolean> => {
  return prisma.user
    .count({ where: { email, confirmation_token: null } })
    .then(Boolean);
};

/**
 * Set a password recovery token for the user.
 *
 * @param {string} email - The email of the user to set the token for.
 * @returns {Promise<string>} - A promise that resolves to the generated token.
 */
export const setPasswordRecoveryToken = async (
  email: User['email'],
): Promise<string> => {
  const token: string = generateToken(20);
  await prisma.user.update({
    data: {
      reset_password_sent_at: new Date(),
      reset_password_token: token,
    },
    where: { email },
  });
  return token;
};

/**
 * Check if the user is in the process of recovering their password.
 *
 * @param {string} reset_password_token - The token used for password recovery.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user is recovering their password.
 */
export const userIsRecovering = async (
  reset_password_token: User['reset_password_token'],
): Promise<boolean> => {
  return await prisma.user
    .count({
      where: {
        reset_password_token,
        reset_password_sent_at: { not: null },
        confirmation_token: null,
      },
    })
    .then(Boolean);
};

/**
 * Reset the user's password.
 *
 * @param {string} reset_password_token - The token used for password recovery.
 * @param {string} password - The new password.
 * @returns {Promise<void>} - A promise that resolves when the password has been reset.
 */
export const resetPassword = async (
  reset_password_token: string,
  password: string,
): Promise<void> => {
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
};

/**
 * Retrieve all users.
 * @returns {Promise<User[]>} - A promise that resolves to an array of users.
 */
export const getUsers = async (): Promise<User[]> => {
  return await prisma.user.findMany();
};

/**
 * Retrieve a user by their ID.
 *
 * @param {number} id - The ID of the user to retrieve.
 * @returns {Promise<User | null>} - A promise that resolves to the user or null if not found.
 */
export const getUserById = async (id: User['id']): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { id } });
};

/**
 * Retrieve a user by their email.
 *
 * @param {string} email - The email of the user to retrieve.
 * @returns {Promise<User | null>} - A promise that resolves to the user or null if not found.
 */
export const getUserByEmail = async (
  email: User['email'],
): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { email } });
};

/**
 * Create a new user.
 *
 * @param {string} email - The email of the new user.
 * @param {string} password - The password of the new user.
 * @param {string | null} current_sign_in_ip - The IP address from which the user is signing in.
 * @returns {Promise<User>} - A promise that resolves to the created user.
 */
export const createUser = async (
  email: User['email'],
  password: string,
  current_sign_in_ip: string | null,
): Promise<User> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      confirmation_token: generateToken(64),
      current_sign_in_ip,
    },
  });
};

/**
 * Confirm the user with the given confirmation token.
 *
 * @param {string} confirmation_token - The confirmation token.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user was confirmed.
 */
export const confirmUser = async (
  confirmation_token: string,
): Promise<boolean> => {
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
};

/**
 * Delete a user by their email.
 *
 * @param {string} email - The email of the user to delete.
 * @returns {Promise<User>} - A promise that resolves to the deleted user.
 */
export const deleteUserByEmail = async (
  email: User['email'],
): Promise<User> => {
  return await prisma.user.delete({ where: { email } });
};

/**
 * Find or create an OAuth user.
 *
 * @param {string} email - The email of the OAuth user.
 * @param {string} provider - The OAuth provider.
 * @param {string} current_ip - The current IP address of the user.
 * @returns {Promise<User>} - A promise that resolves to the found or created user.
 */
export const findOrCreateOauthUser = async (
  email: string,
  provider: string,
  current_ip: string,
): Promise<User> => {
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
      current_ip,
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
};

/**
 * Update user sign-in information.
 *
 * @param {number} id - The ID of the user.
 * @param {Date | null} last_sign_in_at - The last sign-in date.
 * @param {string | null} last_sign_in_ip - The last sign-in IP address.
 * @param {string | null} current_sign_in_ip - The current sign-in IP address.
 * @returns {Promise<void>} - A promise that resolves when the sign-in information has been updated.
 */
export const touchUserOnSignIn = async (
  id: number,
  last_sign_in_at: Date | null,
  last_sign_in_ip: string | null,
  current_sign_in_ip: string | null,
): Promise<void> => {
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
};

/**
 * Validate the user's form input during sign-in.
 *
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @param {string} current_ip - The current IP address of the user.
 * @returns {Promise<Omit<User, "password"> | null>} - A promise that resolves to the user without the password or null if validation fails.
 */
export const validateFormUser = async (
  email: string,
  password: string,
  current_ip: string,
): Promise<Omit<User, 'password'> | null> => {
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
    current_ip,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
};
