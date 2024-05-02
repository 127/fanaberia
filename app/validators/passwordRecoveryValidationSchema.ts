import * as yup from "yup";
const passwordRecoveryValidationSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("sing.in.error.email.not.valid")
    .required("sing.in.error.email.is.required"),
});

export default passwordRecoveryValidationSchema;
