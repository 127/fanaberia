import { UNAUTHORIZED_INDEX } from '~/utils/utils.common';
import { authenticator } from '~/services/auth.server';
import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';

export const action = async ({ request }: ActionFunctionArgs) =>
  await authenticator.logout(request, { redirectTo: UNAUTHORIZED_INDEX });

export const loader = async () => redirect(UNAUTHORIZED_INDEX);
