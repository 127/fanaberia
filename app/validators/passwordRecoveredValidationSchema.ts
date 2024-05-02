import * as yup from "yup";
const passwordRecoveredValidationSchema = yup.object({
  password: yup
    .string()
    .required("sing.in.error.password.is.required")
    .min(6, "sing.in.error.password.too.short")
    .max(24, "sing.in.error.password.too.long")
    .matches(/(.*[A-Z].*)/, "sing.up.error.password.not.contains.uppercase")
    .matches(/(.*\d.*)/, "sing.up.error.password.not.contains.digit"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password")], "sing.in.error.password.confirmation"),
});

export default passwordRecoveredValidationSchema;
