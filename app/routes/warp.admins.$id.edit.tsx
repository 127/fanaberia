import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form, useActionData } from "@remix-run/react";
import { AdminData, getAdminById, updateAdmin } from "~/models/admin.server";
import { Button, Input } from "@nextui-org/react";
import { authenticateUserByRole } from "~/utils/utils.server";
import { useState, useEffect } from "react";
import adminValidaionSchema from "~/validators/adminValidationSchema";
import * as yup from "yup";
import { useTranslation } from "react-i18next";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }
  const admin = await getAdminById(Number(params.id));
  if (!admin) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ admin });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  const formData = await request.formData();

  const fields: AdminData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    passwordConfirmation: formData.get("passwordConfirmation") as string,
  };

  try {
    await adminValidaionSchema.validate(fields, { abortEarly: false });
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.reduce(
        (acc, error) => ({
          ...acc,
          [String(error.path)]: error.message,
        }),
        {}
      );
      // console.log(errors);
      return json({ errors, fields });
    }
    // Handle unexpected errors
    throw err;
  }
  try {
    await updateAdmin(
      Number(params.id),
      fields.email,
      fields.password as string
    );
    return redirect(`/warp/admins/${params.id}/show`);
  } catch (error) {
    return json({ errors: { common: "DB error" }, fields });
  }
};

export default function WarpAdminsEdit() {
  const { t } = useTranslation("common");
  const { admin } = useLoaderData<typeof loader>();
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
      <h1 className="font-bold text-lg">Edit admin</h1>
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
          value={
            (values?.["email" as keyof typeof values] as string) ?? admin.email
          }
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

        <p>Created at: {new Date(admin.created_at).toUTCString()}</p>
        <p>Updated at: {new Date(admin.updated_at).toUTCString()}</p>
        <Button type="submit" color="primary" size="lg">
          save
        </Button>
      </Form>
    </div>
  );
}
