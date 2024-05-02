import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Form, useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { getSession, commitSession } from "~/services/session.server";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { EyeSlashFilledIcon } from "~/assets/EyeSlashFilledIcon";
import { EyeFilledIcon } from "~/assets/EyeFilledIcon";
import { useTranslation } from "react-i18next";
import { OauthLinksPanel } from "~/components/AuthSocials";
import { getClientIPAddress } from "~/utils/utils.server";
import {
  AUTHENTICATION_FAILURE_PATHS,
  AUTHORIZED_USER_INDEX,
} from "~/utils/utils.common";
import i18next from "../i18next.server";
import { UserData } from "~/models/user.server";

export const action = async ({ request }: ActionFunctionArgs) =>
  await authenticator.authenticate("form", request, {
    successRedirect: AUTHORIZED_USER_INDEX,
    failureRedirect: AUTHENTICATION_FAILURE_PATHS.user,
    throwOnError: true,
    context: { ip: getClientIPAddress(request) },
  });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: AUTHORIZED_USER_INDEX,
  });
  const t = await i18next.getFixedT(request, "common");
  const session = await getSession(request.headers.get("Cookie"));
  const msg = await session.get("sessionErrorKey");
  const res = msg && msg.message ? JSON.parse(msg.message) : false;
  session.unset("sessionErrorKey");

  return json(
    {
      meta: {
        title: t("meta.auth.sign-in.title"),
        description: t("meta.auth.sign-in.description"),
        keywords: t("meta.auth.sign-in.keywords"),
      },
      errors: res.errors,
      fields: res.fields,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.meta.title },
    { name: "description", content: data?.meta.description },
    { name: "keywords", content: data?.meta.keywords },
  ];
};

export default function SignIn() {
  const [searchParams] = useSearchParams();
  const registered = searchParams.get("registered") || false;
  const confirmed = searchParams.get("confirmed") || false;
  const recovered = searchParams.get("recovered") || false;
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
      <h1 className="flex w-full flex-col">{t("sign.in.with.label")}</h1>
      <OauthLinksPanel className="flex w-full flex-row gap-4" />
      <div className="inline-flex items-center justify-center w-full">
        <hr className="w-64 h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
        <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-black">
          {t("common.label.or")}
        </span>
      </div>
      <Form method="post" className="flex w-full flex-col mb-4 gap-4">
        {registered && (
          <Card className="bg-success-200">
            <CardBody>{t("sign.up.success")}</CardBody>
          </Card>
        )}
        {confirmed && (
          <Card className="bg-success-200">
            <CardBody>{t("sign.up.success.confirmed")}</CardBody>
          </Card>
        )}
        {recovered && (
          <Card className="bg-success-200">
            <CardBody>{t("sign.up.success.recovered")}</CardBody>
          </Card>
        )}

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
          label={t("commom.label.email")}
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
          label={t("commom.label.password")}
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
        <Link to="/auth/recover">{t("recover.link")}</Link>
      </Form>
    </div>
  );
}
