import {
  ActionFunctionArgs,
  // LoaderFunctionArgs,
  // json,
  redirect,
} from "@remix-run/node";
import { commitSession, getSession } from "~/services/session.server";
// import i18next from "~/i18next.server";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const session = await getSession(request.headers.get("Cookie"));
//   const locale =
//     (await session.get("lng")) ?? (await i18next.getLocale(request));
//   return json({ locale });
// };

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
  // return json(
  //   { locale },
  //   {
  //     headers: {
  //       "Set-Cookie": await commitSession(session),
  //     },
  //   }
  // );
};
