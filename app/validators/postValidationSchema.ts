import * as yup from 'yup';

const postValidationSchema = yup.object({
  slug: yup
    .string()
    .trim()
    .matches(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens',
    )
    .min(5, 'Name must be at least 5 characters long')
    .required('This field is required'),
  title: yup
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters long')
    .required('This field is required'),
  keywords: yup
    .string()
    .trim()
    .min(5, 'Keywords must be at least 5 characters long')
    .required('This field is required'),
  description: yup
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters long')
    .required('This field is required'),
  heading: yup
    .string()
    .trim()
    .min(5, 'Heading must be at least 5 characters long')
    .required('This field is required'),
  summary: yup
    .string()
    .trim()
    .min(5, 'Summary must be at least 5 characters long')
    .required('This field is required'),
  picture: yup
    .string()
    .url('Picture must be a valid URL')
    .required('Picture URL is required'),
  content: yup
    .string()
    .trim()
    .min(50, 'Content must be at least 50 characters long')
    .required('This field is required'),
  category_id: yup
    .number()
    .positive('Category ID must be a positive number')
    .integer('Category ID must be an integer')
    .required('Category ID is required'),
});

export default postValidationSchema;
