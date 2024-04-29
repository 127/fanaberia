import invariant from "tiny-invariant";
import type { Admin, User } from "@prisma/client";
import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import { validateFormUser, findOrCreateOauthUser } from "~/models/user.server";
import { validateFormAdmin } from "~/models/admin.server";
import { GoogleStrategy, SocialsProvider } from "remix-auth-socials";
import userSignInValidationSchema from "~/validators/userSignInValidationSchema";
import { ValidationError } from "yup";

// invariant(process.env.APPLE_SERVICE_ID, "APPLE_SERVICE_ID must be set");
// invariant(process.env.APPLE_TEAM_ID, "APPLE_TEAM_ID must be set");
// invariant(process.env.APPLE_KEY_ID, "APPLE_TEAM_ID must be set");
// invariant(process.env.APPLE_K8_PATH, "APPLE_K8_PATH path must be set");
// invariant(process.env.APPLE_CLIENT_ID, "APPLE_CLIENT_ID path must be set");

invariant(process.env.GOOGLE_CLIENT_ID, "FACEBOOK_CLIENT_ID must be set");
invariant(process.env.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET must be set");

// invariant(process.env.FACEBOOK_CLIENT_ID, "FACEBOOK_CLIENT_ID must be set");
// invariant(
//   process.env.FACEBOOK_CLIENT_SECRET,
//   "FACEBOOK_CLIENT_SECRET must be set"
// );

export const authenticator = new Authenticator<User | Admin>(sessionStorage, {
  sessionErrorKey: "sessionErrorKey",
});

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    if (!context) {
      throw new AuthorizationError(
        JSON.stringify({ common: "sing.in.context.ip" })
      );
    }
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
    // console.log('validationResult',validationResult, formObj, formObj === validationResult);
    if (validationResult != formObj) {
      throw new AuthorizationError(JSON.stringify(validationResult));
    }

    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const user = await validateFormUser(email, password, context.ip as string);
    // console.log('user', user);
    if (!user) {
      throw new AuthorizationError(
        JSON.stringify({ common: "sing.in.error.common" })
      );
    } else if (!user.confirmed_at) {
      throw new AuthorizationError(
        JSON.stringify({ common: "sing.in.error.confirm" })
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
          JSON.stringify({ common: "sing.in.context.ip" })
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
          JSON.stringify({ common: "sing.in.error.social" })
        );
      }
      return await Promise.resolve({ ...user });
    }
  ),
  "google"
);

// authenticator.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: `/auth/${SocialsProvider.FACEBOOK}/callback`,
//     },
//     async ({ profile, context }) => {
//       if (!context) {
//         throw new AuthorizationError(
//           JSON.stringify({ common: "sing.in.context.ip" })
//         );
//       }
//       // console.log(profile);
//       // const email = profile._json.email;
//       const user = await findOrCreateOauthUser(
//         profile._json.email,
//         "fb",
//         context.ip as string
//       );
//       // console.log('user', user);
//       if (!user) {
//         throw new AuthorizationError(
//           JSON.stringify({ common: "sing.in.error.social" })
//         );
//       }
//       return await Promise.resolve({ ...user });
//     }
//   ),
//   "facebook"
// );

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
    // console.log('validationResult',validationResult, formObj, formObj === validationResult);
    if (validationResult != formObj) {
      throw new AuthorizationError(JSON.stringify(validationResult));
    }

    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const user = await validateFormAdmin(email, password);
    // console.log('admin', admin);
    if (!user) {
      throw new AuthorizationError(
        JSON.stringify({ common: "sing.in.error.common" })
      );
    }
    return await Promise.resolve({ ...(user as Admin) });
  }),
  "form-admin"
);
