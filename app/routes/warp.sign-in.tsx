import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { getSession, commitSession } from "~/services/session.server";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { EyeSlashFilledIcon } from "~/assets/EyeSlashFilledIcon";
import { EyeFilledIcon } from "~/assets/EyeFilledIcon";
import { useTranslation } from "react-i18next";
import { UserData } from "~/models/user.server";

export const action = async ({ request }: ActionFunctionArgs) =>
  await authenticator.authenticate("form-admin", request, {
    successRedirect: "/warp",
    failureRedirect: "/warp/sign-in",
    throwOnError: true,
  });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/warp",
  });

  const session = await getSession(request.headers.get("Cookie"));
  const msg = await session.get("sessionErrorKey");
  const res = msg && msg.message ? JSON.parse(msg.message) : false;
  // console.log("errors", res, msg);
  session.unset("sessionErrorKey");

  return json(
    { errors: res.errors, fields: res.fields },
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

  const [values, setValues] = useState<UserData>();
  const [errors, setErrors] = useState(loaderData?.errors);

  const handleChange = (name: string, value: string) => {
    // console.log(name, value);
    setValues((prevValues) => ({ ...(prevValues as UserData), [name]: value }));

    if (errors?.[name as keyof typeof errors]) {
      setErrors((prevErrors: { [key: string]: string }) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  useEffect(() => {
    if (loaderData?.errors) {
      setErrors(loaderData.errors);
    }
    if (loaderData?.fields) {
      setValues(loaderData.fields);
    }
  }, [loaderData]);

  return (
    <div className="flex flex-col gap-4 mx-auto w-full md:w-2/3 lg:w-1/4">
      <h1 className="flex w-full flex-col">Admin {t("sign.in.with.label")}</h1>
      <Form method="post" className="flex w-full flex-col mb-4 gap-4">
        {errors &&
          errors.common &&
          Object.entries(errors).map(([key, value]) => (
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
          value={(values?.["email" as keyof typeof values] as string) ?? ""}
          onChange={(e) => handleChange("email", e.target.value)}
          {...(errors && errors["email" as keyof typeof errors]
            ? {
                isInvalid: true,
                errorMessage: t(errors["email" as keyof typeof errors]),
              }
            : {})}
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
          value={(values?.["password" as keyof typeof values] as string) ?? ""}
          onChange={(e) => handleChange("password", e.target.value)}
          {...(errors && errors["password" as keyof typeof errors]
            ? {
                isInvalid: true,
                errorMessage: t(errors["password" as keyof typeof errors]),
              }
            : {})}
        />
        <Button type="submit" color="primary" size="lg">
          {t("sign.in.label")}
        </Button>
      </Form>
    </div>
  );
}
