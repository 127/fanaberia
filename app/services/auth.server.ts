import invariant from "tiny-invariant";
import type { Admin, User } from "@prisma/client";
import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import { validateFormUser, findOrCreateOauthUser } from "~/models/user.server";
import { validateFormAdmin } from "~/models/admin.server";
import { GoogleStrategy, SocialsProvider } from "remix-auth-socials";
import userSignInValidationSchema from "~/validators/userSignInValidationSchema";
import * as yup from "yup";

invariant(process.env.GOOGLE_CLIENT_ID, "FACEBOOK_CLIENT_ID must be set");
invariant(process.env.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET must be set");

export const authenticator = new Authenticator<User | Admin>(sessionStorage, {
  sessionErrorKey: "sessionErrorKey",
});

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    if (!context) {
      throw new AuthorizationError(
        JSON.stringify({ errors: { common: "sing.in.context.ip" } })
      );
    }
    const formObj = Object.fromEntries(form);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    try {
      await userSignInValidationSchema.validate(formObj, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = err.inner.reduce(
          (acc, error) => ({
            ...acc,
            [String(error.path)]: error.message,
          }),
          {}
        );
        throw new AuthorizationError(
          JSON.stringify({ errors, fields: { email, password } })
        );
      }
    }

    const user = await validateFormUser(email, password, context.ip as string);
    // console.log('user', user);
    if (!user) {
      throw new AuthorizationError(
        JSON.stringify({
          errors: { common: "sing.in.error.common" },
          fields: { email, password },
        })
      );
    } else if (!user.confirmed_at) {
      throw new AuthorizationError(
        JSON.stringify({
          errors: { common: "sing.in.error.confirm" },
          fields: { email, password },
        })
      );
    } else {
      return await Promise.resolve({ ...(user as User) });
    }
  }),
  "form"
);

authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `/auth/${SocialsProvider.GOOGLE}/callback`,
    },
    async ({ profile, context }) => {
      if (!context) {
        throw new AuthorizationError(
          JSON.stringify({ errors: { common: "sing.in.context.ip" } })
        );
      }
      // console.log('profile', profile);
      const user = await findOrCreateOauthUser(
        profile._json.email,
        "fb",
        context.ip as string
      );
      // console.log('user', user);
      if (!user) {
        throw new AuthorizationError(
          JSON.stringify({ errors: { common: "sing.in.error.social" } })
        );
      }
      return await Promise.resolve({ ...user });
    }
  ),
  "google"
);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const formObj = Object.fromEntries(form);

    const email = form.get("email") as string;
    const password = form.get("password") as string;
    try {
      await userSignInValidationSchema.validate(formObj, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = err.inner.reduce(
          (acc, error) => ({
            ...acc,
            [String(error.path)]: error.message,
          }),
          {}
        );
        throw new AuthorizationError(
          JSON.stringify({ errors, fields: { email, password } })
        );
      }
    }

    const user = await validateFormAdmin(email, password);
    // console.log('admin', admin);
    if (!user) {
      throw new AuthorizationError(
        JSON.stringify({ errors: { common: "sing.in.error.common" } })
      );
    }
    return await Promise.resolve({ ...(user as Admin) });
  }),
  "form-admin"
);
