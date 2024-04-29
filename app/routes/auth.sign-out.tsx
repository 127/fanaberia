import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { UNAUTHORIZED_INDEX } from "~/utils/utils.common";

export const action = async ({ request }: ActionFunctionArgs) =>
  await authenticator.logout(request, { redirectTo: UNAUTHORIZED_INDEX });

export const loader = async () => redirect(UNAUTHORIZED_INDEX);
