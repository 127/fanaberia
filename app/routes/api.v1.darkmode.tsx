import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { commitSession, getSession } from "~/services/session.server";

export const DARKMODE_DEFAULT = true;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const isDarkMode = await session.get("isDarkMode") ?? DARKMODE_DEFAULT;
  return json({ isDarkMode });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const isDarkMode =
    JSON.parse(formData.get("isDarkMode") as string) ?? DARKMODE_DEFAULT;
  session.set("isDarkMode", isDarkMode);

  return json(
    { isDarkMode },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};
