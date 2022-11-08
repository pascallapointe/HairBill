import React, {
  forwardRef,
  PropsWithRef,
  useImperativeHandle,
  useState,
} from 'react';
import { z, ZodString } from 'zod';
import { FormControl, Icon, Input } from 'native-base';
import ValidationErrors from '@components/form/validation-errors';
import type { AutoCapitalize, AutoCompleteType } from '@type/form.type';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';

export type Props = {
  name: string;
  id?: string;
  label?: string | boolean;
  value?: string;
  placeholder?: string;
  required?: boolean;
  autocomplete?: AutoCompleteType;
  autoCapitalize?: AutoCapitalize;
  validation?: boolean;
  schema?: ZodString;
  icon?: JSX.Element;
};

const InputLabel: React.FC<{
  label: string | boolean;
  fallback: string;
}> = ({ label, fallback }) => {
  if (label) {
    return (
      <FormControl.Label>
        {typeof label === 'string' && label.length ? label : fallback}
      </FormControl.Label>
    );
  }

  return null;
};

const InputIcon: React.FC<{ icon?: JSX.Element }> = ({ icon }) => {
  if (icon) {
    return <Icon as={icon} size={5} ml="2" color="muted.400" />;
  }
  return null;
};

const TextInput: React.FC<PropsWithRef<Props>> = forwardRef(
  (
    {
      name,
      label = true,
      value,
      placeholder,
      autocomplete = 'off',
      autoCapitalize = 'none',
      required = true,
      validation = true,
      schema = z.string({
        required_error: 'Required',
        invalid_type_error: 'Must be a string',
      }),
      icon,
      ...props
    },
    ref,
  ) => {
    const [init, setInit] = useState(false);
    const [_value, setValue] = useState(value);
    const [error, setError] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    function initValidation(
      e: NativeSyntheticEvent<TextInputFocusEventData>,
    ): void {
      if (!init && validation) {
        validate(e.nativeEvent.text);
      }
      setInit(true);
    }

    function validate(val?: string): boolean {
      let result = schema.safeParse(val ? val : _value);

      setError(!result.success);
      setErrorMessages([]);

      if (!result.success) {
        setErrorMessages(result.error.issues.map(issue => issue.message));
      }

      return result.success;
    }

    useImperativeHandle(ref, () => ({ validate }));

    function handleChange(val: string) {
      setValue(val);
      if (init && validation) {
        console.log(validate(val));
      }
    }

    return (
      <FormControl
        isInvalid={error}
        isRequired={required}
        minW="100%"
        {...props}>
        <InputLabel label={label} fallback={name} />
        <Input
          onBlur={initValidation}
          onChangeText={handleChange}
          autoComplete={autocomplete}
          autoCapitalize={autoCapitalize}
          InputLeftElement={<InputIcon icon={icon} />}
          value={_value}
          placeholder={placeholder ? placeholder : ''}
        />
        <ValidationErrors error={error} errorMessages={errorMessages} />
      </FormControl>
    );
  },
);

export default TextInput;
