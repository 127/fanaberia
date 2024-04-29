import * as Yup from "yup";
const passwordRecoveryValidationSchema = () =>
  Yup.object().shape({
    email: Yup.string()
      .trim()
      .email("sing.in.error.email.not.valid")
      .required("sing.in.error.email.is.required"),
  });

export default passwordRecoveryValidationSchema;
