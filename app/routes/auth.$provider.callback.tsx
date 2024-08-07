import {
  AUTHENTICATION_FAILURE_PATHS,
  AUTHORIZED_USER_INDEX,
} from '~/utils/utils.common';
import { authenticator } from '~/services/auth.server';
import { getClientIPAddress } from '~/utils/utils.server';
import type { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request, params }: LoaderFunctionArgs) =>
  await authenticator.authenticate(params.provider as string, request, {
    successRedirect: AUTHORIZED_USER_INDEX,
    failureRedirect: AUTHENTICATION_FAILURE_PATHS.user,
    context: { ip: getClientIPAddress(request) },
  });
