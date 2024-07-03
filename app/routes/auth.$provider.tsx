import { AUTHENTICATION_FAILURE_PATHS } from '~/utils/utils.common';
import { authenticator } from '~/services/auth.server';
import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';

export const loader = async () => redirect(AUTHENTICATION_FAILURE_PATHS.user);

export const action = async ({ request, params }: ActionFunctionArgs) =>
  await authenticator.authenticate(params.provider as string, request);
