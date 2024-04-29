import type { Admin } from "@prisma/client";
import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import { validateFormAdmin } from "~/models/admin.server";
import userSignInValidationSchema from "~/validators/userSignInValidationSchema";
import { ValidationError } from "yup";

export const authenticator = new Authenticator<Admin>(sessionStorage, {
  sessionErrorKey: "sessionErrorKey",
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const formObj = Object.fromEntries(form);
    const validationResult = await userSignInValidationSchema()
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
    if (validationResult != formObj) {
      throw new AuthorizationError(JSON.stringify(validationResult));
    }

    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const user = await validateFormAdmin(email, password);
    if (!user) {
      throw new AuthorizationError(
        JSON.stringify({ common: "sing.in.error.common" })
      );
    }
    return await Promise.resolve({ ...(user as Admin) });
  }),
  "form-admin"
);
