import * as yup from 'yup';
import i18n from '~/i18n';

// Define the schema
const categoryValidaionSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(5, 'Name must be at least 5 characters long')
    .required('This field is required'),
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
  locale: yup
    .string()
    .oneOf(i18n.supportedLngs, 'Invalid locale')
    .required('This field is required'),
});

export default categoryValidaionSchema;
