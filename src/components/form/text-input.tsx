import React, {
  forwardRef,
  PropsWithRef,
  useImperativeHandle,
  useState,
} from 'react';
import { z, ZodString } from 'zod';
import { FormControl, Icon, Input } from 'native-base';
import ValidationErrors from '@components/form/validation-errors';
import type {
  AutoCapitalizeType,
  AndroidAutoCompleteType,
  iOSClearButtonModeType,
  KeyboardType,
} from '@type/form.type';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import type { ThemeComponentSizeType } from 'native-base/lib/typescript/components/types';

export type Props = {
  name: string;
  id?: string;
  label?: string | boolean;
  value?: string;
  placeholder?: string;
  size?: ThemeComponentSizeType<'Input'>;
  color?: string;
  fontWeight?: string;
  required?: boolean;
  clear?: iOSClearButtonModeType;
  autoComplete?: AndroidAutoCompleteType;
  autoCorrect?: boolean;
  autoCapitalize?: AutoCapitalizeType;
  keyboardType?: KeyboardType;
  secureTextEntry?: boolean;
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
      <FormControl.Label _text={{ fontSize: 'md', fontWeight: 'bold' }}>
        {typeof label === 'string' && label.length ? label : fallback}
      </FormControl.Label>
    );
  }

  return null;
};

const InputIcon: React.FC<{ icon?: JSX.Element }> = ({ icon }) => {
  if (icon) {
    return <Icon as={icon} top="1px" size={5} ml="2" color="muted.400" />;
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
      size = 'md',
      color = 'light.600',
      fontWeight = 'bold',
      clear = 'never',
      autoComplete = 'off',
      autoCorrect = false,
      autoCapitalize = 'none',
      keyboardType = 'default',
      secureTextEntry = false,
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

    function initAndValidate(
      e: NativeSyntheticEvent<TextInputFocusEventData>,
    ): void {
      if (!init) setInit(true);
      if (validation) validate(e.nativeEvent.text);
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
        validate(val);
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
          onBlur={initAndValidate}
          onChangeText={handleChange}
          clearButtonMode={clear}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          InputLeftElement={<InputIcon icon={icon} />}
          value={_value}
          placeholder={placeholder ? placeholder : ''}
          _focus={{ borderColor: 'violet.700', bg: 'fuchsia.100' }}
          color={color}
          fontWeight={fontWeight}
          size={size}
        />
        <ValidationErrors error={error} errorMessages={errorMessages} />
      </FormControl>
    );
  },
);

export default TextInput;