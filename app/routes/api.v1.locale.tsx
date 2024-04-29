import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/services/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const locale = formData.get("locale") as string;
  session.set("lng", locale);
  const referer = request.headers.get("Referer");
  const url = new URL(referer ?? request.url);
  const segments = url.pathname.split("/").filter(Boolean);

  let redirectPath = "";
  if (segments[1] === "posts") {
    redirectPath += `/${locale}/posts`;
  } else if (segments[1] === "pages") {
    redirectPath += `/${locale}/pages/${segments[2]}`;
  } else {
    redirectPath += url.pathname;
  }

  return redirect(redirectPath, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
