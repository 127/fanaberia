import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import type { ResponseError } from "../utils/utils.server";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import {
  GoogleReCaptchaProvider,
  GoogleReCaptchaCheckbox,
} from "@google-recaptcha/react";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
// import { useEffect } from "react";
import { authenticator } from "~/services/auth.server";
import { createUser, userExists } from "~/models/user.server";
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
import { ValidationError } from "yup";
import { getSession, commitSession } from "~/services/session.server";

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
  // console.log('init session 0' ,_r, session.has("_r"));
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
      return json<ResponseError>(
        { errors: { message: t("sign.up.error.recaptcha") } },
        {
          status: 400,
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }
  }

  const formObj = Object.fromEntries(formData);
  const validationResult = await userSignUpValidationSchema()
    .validate(formObj, { abortEarly: false })
    .catch((err) => {
      const errors: Record<string, string> = {};
      if (err instanceof ValidationError && err.inner) {
        err.inner.forEach((error: ValidationError) => {
          const path = error.path || "unknown";
          if (!errors[path]) {
            errors[path] = error.message;
          }
        });
      }
      return errors;
    });
  // console.log('validationResult',validationResult, formObj, formObj === validationResult);
  if (validationResult !== formObj) {
    return json<ResponseError>({ errors: validationResult } as ResponseError, {
      status: 400,
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  const email = formData.get("email") as string;
  const isUser: boolean = await userExists(email);
  if (isUser) {
    return json<ResponseError>(
      { errors: { message: t("sign.up.error.user.exists") } },
      {
        status: 400,
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  const password = formData.get("password") as string;
  const user = await createUser(email, password, ip);
  // console.log(user);
  if (!user) {
    return json<ResponseError>(
      { errors: { message: t("sign.up.error.user.failed") } },
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
  const link = `${proto}://${host}/auth/confirm?token=${user.confirmation_token}`;
  try {
    await sendEmail(
      user.email,
      t("sign.up.email.verification.theme"),
      generateEmailHtml({
        brand: t("brand"),
        slogan: t("slogan"),
        body: t("sign.up.email.verification.text", { link }),
        warning: t("common.email.warning"),
      })
    );
  } catch (e) {
    console.log("sendEmail error: ", JSON.stringify(e));
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
        {actionData?.errors?.message &&
          Object.entries(actionData.errors).map(([key, value]) => (
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
          {...(actionData?.errors?.email
            ? { isInvalid: true, errorMessage: t(actionData.errors.email) }
            : { isInvalid: false, errorMessage: null })}
        />
        <Input
          isRequired
          label={t("commom.label.password")}
          name="password"
          type="password"
          variant="bordered"
          autoComplete="new-password"
          {...(actionData?.errors?.password
            ? { isInvalid: true, errorMessage: t(actionData.errors.password) }
            : { isInvalid: false, errorMessage: null })}
        />
        <Input
          isRequired
          label={t("sign.up.label.password.confirmation")}
          type="password"
          name="passwordConfirmation"
          variant="bordered"
          autoComplete="new-password"
          {...(actionData?.errors?.passwordConfirmation
            ? {
                isInvalid: true,
                errorMessage: t(actionData.errors.passwordConfirmation),
              }
            : { isInvalid: false, errorMessage: null })}
        />
        <Checkbox
          isRequired
          name="terms"
          value={actionData?.errors?.terms ? "" : "checked"}
          {...(actionData?.errors?.terms
            ? { isInvalid: true }
            : { isInvalid: false })}
        >
          <Trans i18nKey="sign.up.label.agree">
            <Link to={`/${i18n.language}/pages/terms`} className="underline" />
          </Trans>
        </Checkbox>
        <GoogleReCaptchaProvider siteKey={loaderData.rkey} type="v2-checkbox">
          <GoogleReCaptchaCheckbox language={i18n.language} />
        </GoogleReCaptchaProvider>
        <Button type="submit" color="primary" size="lg" className="max-w-xs">
          {t("sign.up.label")}
        </Button>
      </Form>
    </div>
  );
}
