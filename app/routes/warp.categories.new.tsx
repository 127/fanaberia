import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { CategoryData, createCategory } from "~/models/category.server";
import { authenticateUserByRole } from "~/utils/utils.server";
import { capitalizeFirstLetter } from "~/utils/utils.common";
import i18n from "~/i18n";
import catefgoryValidaionSchema from "~/validators/categoryValidaionSchema";
import * as yup from "yup";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  const locales = i18n.supportedLngs.map((locale) => ({
    label: capitalizeFirstLetter(locale),
    value: locale,
  }));
  return json({ locales });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  const formData = await request.formData();

  const fields: CategoryData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    title: formData.get("title") as string,
    keywords: formData.get("keywords") as string,
    description: formData.get("description") as string,
    heading: formData.get("heading") as string,
    locale: formData.get("locale") as string,
  };

  try {
    await catefgoryValidaionSchema.validate(fields, { abortEarly: false });
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
    const newCategory = await createCategory(fields);
    return redirect(`/warp/categories/${newCategory.id}/show`);
  } catch (error) {
    return json({ errors: { common: "DB error" }, fields });
  }
};

const inputs = "name,slug,title,keywords,description,heading".split(",");

export default function WarpCategoriesNew() {
  const { locales } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [values, setValues] = useState<CategoryData>();
  const [errors, setErrors] = useState(actionData?.errors);

  const handleChange = (name: string, value: string) => {
    setValues((prevValues) => ({
      ...(prevValues as CategoryData),
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
      <h1 className="font-bold text-lg">Add new category</h1>
      <Button as={Link} color="primary" className="w-12" to="/warp/categories">
        Back
      </Button>
      <Form method="post" className="flex w-full flex-col mb-4 gap-4">
        <Select
          isRequired
          name="locale"
          label="Locale"
          selectionMode="single"
          defaultSelectedKeys={[actionData?.fields.locale ?? locales[0].value]}
        >
          {locales.map((locale) => (
            <SelectItem key={locale.value} value={locale.value}>
              {locale.label}
            </SelectItem>
          ))}
        </Select>
        {inputs.map((name) => (
          <Input
            key={`input-${name}`}
            isRequired
            id={name}
            name={name}
            label={capitalizeFirstLetter(name)}
            type="text"
            className="w-full"
            value={values?.[name as keyof typeof values] ?? ""}
            onChange={(e) => handleChange(name, e.target.value)}
            {...(errors && errors[name as keyof typeof errors]
              ? {
                  isInvalid: true,
                  errorMessage: errors[name as keyof typeof errors],
                }
              : {})}
          />
        ))}

        <Button type="submit" color="primary" size="lg">
          save
        </Button>
      </Form>
    </div>
  );
}
