import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { AUTHENTICATION_FAILURE_PATHS } from "~/utils/utils.common";

export const loader = async () => redirect(AUTHENTICATION_FAILURE_PATHS.user);

export const action = async ({ request, params }: ActionFunctionArgs) =>
  await authenticator.authenticate(params.provider as string, request);
