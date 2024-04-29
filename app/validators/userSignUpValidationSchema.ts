import * as Yup from "yup";
const userSignUpValidationSchema = () =>
  Yup.object().shape({
    email: Yup.string()
      .trim()
      .email("sing.in.error.email.not.valid")
      .required("sing.in.error.email.is.required"),
    password: Yup.string()
      .required("sing.in.error.password.is.required")
      .min(6, "sing.in.error.password.too.short")
      .max(24, "sing.in.error.password.too.long")
      .matches(/(.*[A-Z].*)/, "sing.up.error.password.not.contains.uppercase")
      .matches(/(.*\d.*)/, "sing.up.error.password.not.contains.digit"),
    passwordConfirmation: Yup.string().oneOf(
      [Yup.ref("password")],
      "sing.in.error.password.confirmation"
    ),
    terms: Yup.mixed().test(
      "isChecked",
      "sing.up.error.terms",
      (value) => value === "checked"
    ),
  });

export default userSignUpValidationSchema;
