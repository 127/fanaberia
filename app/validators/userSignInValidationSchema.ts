import * as yup from 'yup';
const userSignInValidationSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('sing.in.error.email.not.valid')
    .required('sing.in.error.email.is.required'),
  password: yup
    .string()
    .required('sing.in.error.password.is.required')
    .min(6, 'sing.in.error.password.too.short')
    .max(24, 'sing.in.error.password.too.long')
    .matches(/(.*[A-Z].*)/, 'sing.up.error.password.not.contains.uppercase')
    .matches(/(.*\d.*)/, 'sing.up.error.password.not.contains.digit'),
});

export default userSignInValidationSchema;
