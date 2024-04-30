import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { getSession, commitSession } from "~/services/session.server";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { EyeSlashFilledIcon } from "~/assets/EyeSlashFilledIcon";
import { EyeFilledIcon } from "~/assets/EyeFilledIcon";
import { useTranslation } from "react-i18next";

export const action = async ({ request }: ActionFunctionArgs) => {
  const admin = await authenticator.authenticate("form-admin", request, {
    successRedirect: "/warp",
    failureRedirect: "/warp/sign-in",
    throwOnError: true,
  });
  return admin;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/warp",
  });

  const session = await getSession(request.headers.get("Cookie"));
  const msg = await session.get("sessionErrorKey");
  const errors = msg && msg.message ? JSON.parse(msg.message) : false;
  session.unset("sessionErrorKey");

  return json(
    { errors },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const meta: MetaFunction = () => [{ title: "Sign in" }];

export default function Login() {
  const loaderData = useLoaderData<typeof loader>();
  const { t } = useTranslation("common");
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="flex flex-col gap-4 mx-auto w-full md:w-2/3 lg:w-1/4">
      <h1 className="flex w-full flex-col">Admin {t("sign.in.with.label")}</h1>
      <Form method="post" className="flex w-full flex-col mb-4 gap-4">
        {loaderData.errors.common &&
          Object.entries(loaderData.errors).map(([key, value]) => (
            <Card className="flex gap-4 bg-warning-400" key={"error-" + key}>
              <CardBody>{t(value as string)}</CardBody>
            </Card>
          ))}

        <Input
          isRequired
          type="text"
          label="Email"
          name="email"
          variant="bordered"
          autoComplete="username email"
          {...(loaderData.errors.email
            ? { isInvalid: true, errorMessage: t(loaderData.errors.email) }
            : { isInvalid: false, errorMessage: null })}
        />
        <Input
          isRequired
          label="Password"
          name="password"
          variant="bordered"
          autoComplete="current-password"
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          type={isVisible ? "text" : "password"}
          {...(loaderData.errors.password
            ? { isInvalid: true, errorMessage: t(loaderData.errors.password) }
            : { isInvalid: false, errorMessage: null })}
        />
        <Button type="submit" color="primary" size="lg">
          {t("sign.in.label")}
        </Button>
      </Form>
    </div>
  );
}
