import { cssBundleHref } from "@remix-run/css-bundle";
import stylesheet from "~/tailwind.css?url";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { useChangeLanguage } from "remix-i18next/react";
import i18next from "./i18next.server";
import { Divider, NextUIProvider } from "@nextui-org/react";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { authenticator } from "./services/auth.server";
import MetaIconsLinks from "./components/MetaIconsLinks";
import { getSession } from "./services/session.server";
import { DARKMODE_DEFAULT } from "./routes/api.v1.darkmode";
import { Logo } from "./assets/Logo";
import { useTranslation } from "react-i18next";
// new
// export const links: LinksFunction = () => [
//   ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
// ];

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet, as: "style" },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "common",
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // console.log('loader root'); root loader is iinvoced on any child
  const user = await authenticator.isAuthenticated(request);
  const session = await getSession(request.headers.get("Cookie"));
  const isDarkMode = (await session.get("isDarkMode")) ?? DARKMODE_DEFAULT;
  const locale =
    (await session.get("lng")) ?? (await i18next.getLocale(request));
  return json({
    locale,
    user,
    ENV: { NODE_ENV: process.env.NODE_ENV },
    isDarkMode,
  });
};

export default function App() {
  const { locale, user, ENV, isDarkMode } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);
  return (
    <html lang={locale}>
      <head>
        <MetaIconsLinks env={ENV.NODE_ENV} />
        <Meta />
        <Links />
      </head>
      <body
        className={`${
          isDarkMode && "dark "
        }text-foreground bg-background min-h-screen`}
      >
        <NextUIProvider>
          <Header
            userExists={user !== null ? true : false}
            isDarkMode={isDarkMode}
          />
          <main className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
            <Outlet />
          </main>
          <Footer />
          <ScrollRestoration />
          {/* <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(
              data.ENV
            )}`,
          }}
        /> */}
          <Scripts />
        </NextUIProvider>
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation("common");
  return (
    <html lang="en">
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body className="dark text-foreground bg-background min-h-screen">
        <main className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
          <h1 className="font-bold text-2xl">
            <Link to="/" className="flex flex-row text-foreground items-center">
              <Logo width={30} height={30} className="me-2 text-foreground" />
              <span className="font-bold text-inherit">{t("brand")}</span>
            </Link>
          </h1>
          <Divider className="my-5" />
          <div className="ps-1">
            <p className="text-xl">
              Error:&nbsp;
              {isRouteErrorResponse(error)
                ? `${error.status} ${error.data}`
                : error instanceof Error
                ? error.message
                : "Unknown Error"}
            </p>
            <p className="py-5">
              <Link to="/" className="underline">
                {t("system.error.home")} &rarr;
              </Link>
            </p>
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
