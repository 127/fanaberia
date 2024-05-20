import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import {
  GoogleReCaptchaProvider,
  GoogleReCaptchaCheckbox,
} from "@google-recaptcha/react";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
// import { useEffect } from "react";
import { authenticator } from "~/services/auth.server";
import { UserData, createUser, userExists } from "~/models/user.server";
import userSignUpValidationSchema from "~/validators/userSignUpValidationSchema";
import { Button, Checkbox, Card, CardBody, Input } from "@nextui-org/react";
import { Trans, useTranslation } from "react-i18next";
import i18next from "~/i18next.server";
import {
  sendEmail,
  validateCaptcha,
  getClientIPAddress,
} from "~/utils/utils.server";
import {
  AUTHENTICATION_FAILURE_PATHS,
  AUTHORIZED_USER_INDEX,
} from "~/utils/utils.common";
import { generateEmailHtml } from "~/templates/generateEmailHtml";
import { OauthLinksPanel } from "~/components/AuthSocials";
import * as yup from "yup";
import { getSession, commitSession } from "~/services/session.server";
import { useState, useEffect } from "react";
import { transporter } from "~/../cypress/emailer";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  invariant(process.env.RECAPTCHA_SITE_KEY, "RECAPTCHA_SITE_KEY must be set");
  // await getSession(request.headers.get("Cookie"));
  await authenticator.isAuthenticated(request, {
    successRedirect: AUTHORIZED_USER_INDEX,
  });
  const t = await i18next.getFixedT(request, "common");
  return json({
    meta: {
      title: t("meta.auth.sign-up.title"),
      description: t("meta.auth.sign-up.description"),
      keywords: t("meta.auth.sign-up.keywords"),
    },
    rkey: process.env.RECAPTCHA_SITE_KEY,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const ip = getClientIPAddress(request);
  const t = await i18next.getFixedT(request, "common");
  const formData = await request.formData();
  // console.log(JSON.stringify(formData));

  const session = await getSession(request.headers.get("Cookie"));
  let _r = await session.get("_r");

  const fields: UserData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    passwordConfirmation: formData.get("passwordConfirmation") as string,
    terms: formData.get("terms") as string,
  };

  if (typeof _r === "undefined" || _r === false) {
    // console.log('init session 1');
    const recaptchaValue = formData.get("g-recaptcha-response");
    const captchaResponse = await validateCaptcha(recaptchaValue);
    // console.log('init session 1', captchaResponse);
    if (captchaResponse.success) {
      session.set("_r", true);
      _r = true;
    } else {
      // console.log('init session 2');
      session.set("_r", false);
      // console.log('init session 3', _r);
      return json(
        { errors: { message: t("sign.up.error.recaptcha") }, fields },
        {
          status: 400,
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }
  }

  try {
    await userSignUpValidationSchema.validate(fields, {
      abortEarly: false,
    });
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.reduce(
        (acc, error) => ({
          ...acc,
          [String(error.path)]: error.message,
        }),
        {}
      );
      return json(
        { errors, fields },
        {
          status: 400,
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }
    throw err;
  }

  const isUser: boolean = await userExists(fields.email);
  if (isUser) {
    return json(
      { errors: { message: t("sign.up.error.user.exists") }, fields },
      {
        status: 400,
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  const user = await createUser(fields.email, fields.password as string, ip);
  if (!user) {
    return json(
      { errors: { message: t("sign.up.error.user.failed") }, fields },
      {
        status: 400,
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  const host = request.headers.get("host");
  const proto = request.headers.get("X-Forwarded-Proto") || "http";
  const link = `${proto}://${host}/auth/confirm/${user.confirmation_token}`;
  const body = t("sign.up.email.verification.text").replace(
    /{{link}}/g,
    `<a href="${link}">${t("sing.in.error.confirm")}</a>`
  );

  const letterHtml = generateEmailHtml({
    brand: t("brand"),
    slogan: t("slogan"),
    body,
    warning: t("common.email.warning"),
  });
  if (process.env.NODE_ENV === "production") {
    try {
      // send email throught POSTMARK
      await sendEmail(
        user.email,
        t("sign.up.email.verification.theme"),
        letterHtml
      );
    } catch (e) {
      console.log("sendEmail sign-up error: ", JSON.stringify(e));
    }
  } else {
    try {
      // send email for auto testing
      transporter.sendMail({
        from: '"Fanaberia autotesting" <testing@fanaberia.io>',
        to: user.email,
        subject: t("sign.up.email.verification.theme"),
        html: letterHtml,
      });
    } catch (e) {
      console.log(
        "Testing transporter.sendMail sign-up error: ",
        JSON.stringify(e)
      );
    }
  }

  if (typeof _r !== "undefined") {
    session.unset("_r");
  }

  return redirect(`${AUTHENTICATION_FAILURE_PATHS.user}?registered=true`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.meta.title },
    { name: "description", content: data?.meta.description },
    { name: "keywords", content: data?.meta.keywords },
  ];
};

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const { i18n, t } = useTranslation("common");

  const [values, setValues] = useState<UserData>();
  const [errors, setErrors] = useState(actionData?.errors);

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
    if (actionData?.errors) {
      setErrors(actionData.errors);
    }
    if (actionData?.fields) {
      setValues(actionData.fields);
    }
  }, [actionData]);

  return (
    <div className="flex flex-col gap-4 mx-auto w-full md:w-2/3 lg:w-1/4">
      <h1 className="flex w-full flex-col">{t("sign.up.with.label")}</h1>
      <OauthLinksPanel className="flex w-full flex-row gap-4" />
      <div className="inline-flex items-center justify-center w-full">
        <hr className="w-64 h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
        <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-black">
          {t("common.label.or")}
        </span>
      </div>
      <Form method="post" className="flex w-full flex-col mb-4 gap-4">
        {errors &&
          errors["message" as keyof typeof errors] &&
          Object.entries(errors).map(([key, value]) => (
            <Card className="flex gap-4 bg-warning-400" key={"error-" + key}>
              <CardBody>{value as string}</CardBody>
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
          type="password"
          variant="bordered"
          autoComplete="new-password"
          value={(values?.["password" as keyof typeof values] as string) ?? ""}
          onChange={(e) => handleChange("password", e.target.value)}
          {...(errors && errors["password" as keyof typeof errors]
            ? {
                isInvalid: true,
                errorMessage: t(errors["password" as keyof typeof errors]),
              }
            : {})}
        />
        <Input
          isRequired
          label={t("sign.up.label.password.confirmation")}
          type="password"
          name="passwordConfirmation"
          variant="bordered"
          autoComplete="new-password"
          value={
            (values?.[
              "passwordConfirmation" as keyof typeof values
            ] as string) ?? ""
          }
          onChange={(e) => handleChange("passwordConfirmation", e.target.value)}
          {...(errors && errors["passwordConfirmation" as keyof typeof errors]
            ? {
                isInvalid: true,
                errorMessage: t(
                  errors["passwordConfirmation" as keyof typeof errors]
                ),
              }
            : {})}
        />
        <Checkbox
          data-testid="terms"
          isRequired
          name="terms"
          value={
            errors && errors["terms" as keyof typeof errors] ? "" : "checked"
          }
          {...(errors?.["terms" as keyof typeof errors]
            ? { isInvalid: true }
            : { isInvalid: false })}
        >
          <Trans i18nKey="sign.up.label.agree">
            <Link to={`/${i18n.language}/pages/terms`} className="underline" />
          </Trans>
        </Checkbox>
        {loaderData.rkey !== "" && (
          <GoogleReCaptchaProvider siteKey={loaderData.rkey} type="v2-checkbox">
            <GoogleReCaptchaCheckbox language={i18n.language} />
          </GoogleReCaptchaProvider>
        )}
        <Button
          type="submit"
          color="primary"
          size="lg"
          className="max-w-xs"
          data-testid="submit"
        >
          {t("sign.up.label")}
        </Button>
      </Form>
    </div>
  );
}
