import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { Button, Input } from "@nextui-org/react";
import { type AdminData, createAdmin } from "~/models/admin.server";
import { authenticateUserByRole } from "~/utils/utils.server";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import adminValidationSchema from "~/validators/adminValidationSchema";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  const formData = await request.formData();

  const fields: AdminData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    passwordConfirmation: formData.get("passwordConfirmation") as string,
  };
  try {
    // Object.fromEntries(formData)
    await adminValidationSchema.validate(fields, { abortEarly: false });
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.reduce(
        (acc, error) => ({
          ...acc,
          [String(error.path)]: error.message,
        }),
        {}
      );
      return json({ errors, fields });
    }
    throw err;
  }
  try {
    const newAdmin = await createAdmin(fields.email, fields.password as string);
    return redirect(`/warp/admins/${newAdmin.id}/show`);
  } catch (error) {
    return json({ errors: { common: "DB error" }, fields });
  }
};

export default function WarpAdminsNew() {
  const { t } = useTranslation("common");
  const actionData = useActionData<typeof action>();
  const [values, setValues] = useState<AdminData>();
  const [errors, setErrors] = useState(actionData?.errors);
  const handleChange = (name: string, value: string) => {
    setValues((prevValues) => ({
      ...(prevValues as AdminData),
      [name]: value,
    }));

    if (errors?.[name as keyof typeof errors]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
      console.log("errors", errors);
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
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Add new admin</h1>
      <Button as={Link} color="primary" className="w-12" to="/warp/admins">
        Back
      </Button>
      <Form method="post" className="flex w-full flex-col mb-4 gap-4">
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
        <Button type="submit" color="primary" size="lg">
          save
        </Button>
      </Form>
    </div>
  );
}
