import * as Yup from "yup";
const passwordRecoveredValidationSchema = () =>
  Yup.object().shape({
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
  });

export default passwordRecoveredValidationSchema;
