// TODO replace any

import * as React from 'react';
import * as yup from 'yup';

import { ProviderType } from '../constants';

interface IFormFieldState<T> {
  value: T;
  setValue: (value: T) => void;
  touched: boolean;
  setTouched: (touched: boolean) => void;
  schema: yup.Schema<T>;
}

interface IValidatedFormFieldState<T> extends IFormFieldState<T> {
  error: yup.ValidationError | null;
  isInvalid: boolean;
}

interface IFormFields {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: IFormFieldState<any>; // TODO does this bite us?
}

type FieldType<T> = T extends IFormFieldState<infer R> ? R : never;

type ValidatedFormFields<F> = {
  [P in keyof F]?: IValidatedFormFieldState<FieldType<F[P]>>;
};

interface IValidatedFormFields {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: IValidatedFormFieldState<any>; // TODO does this bite us?
}

export const useFormField = <T>(initialValue: T, schema: yup.Schema<T>): IFormFieldState<T> => {
  const [value, setValue] = React.useState<T>(initialValue);
  const [touched, setTouched] = React.useState(false);
  return {
    value,
    setValue,
    touched,
    setTouched,
    schema,
  };
};

export const useFormState = (
  fields: IFormFields
): { fields: ValidatedFormFields<IFormFields>; values: any } => {
  const schemaShape = Object.keys(fields).reduce(
    (newObj, key) => ({ ...newObj, [key]: fields[key].schema }),
    {}
  );
  const formSchema = yup.object().shape(schemaShape);
  const values: yup.InferType<typeof formSchema> = Object.keys(fields).reduce(
    (newObj, key) => ({ ...newObj, [key]: fields[key].value }),
    {}
  );
  let result: any | null = null;
  let error: yup.ValidationError | null = null;
  try {
    result = formSchema.validateSync(values);
  } catch (e) {
    error = e;
  }
  const validatedFields: IValidatedFormFields = Object.keys(fields).reduce((newObj, key) => {
    const field = fields[key];
    type FieldType<T> = T extends IFormFieldState<infer R> ? R : never;
    // TODO Is this anything?
    const validatedField: IValidatedFormFieldState<FieldType<typeof field>> = {
      ...field,
      error,
      isInvalid: field.touched && !!error,
    };
    return { ...newObj, [key]: validatedField };
  }, {} as IValidatedFormFields);

  // TODO do we need to worry about debouncing / lag from validating on each keystroke?
  // TODO do we want to memoize?
  // infer the type of all the values and pass that out as one thing
  return {
    fields: validatedFields,
    values,
  };
};

const TestFn: React.FunctionComponent = () => {
  const form = useFormState({
    providerType: useFormField<ProviderType | null>(
      null,
      yup.mixed().oneOf(Object.values(ProviderType)).required()
    ),
    vmwareName: useFormField<string>(
      '',
      yup.string().min(2).max(20).required('A name is min 2 and max 20')
    ),
  });
  const typeIsValid = form.fields.providerType.value;
  return null;
};
