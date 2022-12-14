import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { z, ZodType } from 'zod';
import { FormControl, Icon, IFormControlProps, TextArea } from 'native-base';
import ValidationErrors from '@components/form/validation-errors';
import type {
  AutoCapitalizeType,
  AndroidAutoCompleteType,
  iOSClearButtonModeType,
  KeyboardType,
} from '@type/form.type';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import type { ThemeComponentSizeType } from 'native-base/lib/typescript/components/types';

interface Props extends IFormControlProps {
  bindValue?: (val: any) => void;
  label?: string;
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
  schema?: ZodType;
  icon?: JSX.Element;
}

export type TextAreaRef = {
  validate: (val?: string) => void;
  clearValue: () => void;
  updateSchema: (newSchema: ZodType) => void;
  getValue: () => string;
};

const InputLabel: React.FC<{
  label?: string;
}> = ({ label }) => {
  if (label && label.length) {
    return (
      <FormControl.Label _text={{ fontSize: 'md', fontWeight: 'bold' }}>
        {label}
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

const TextAreaInput = forwardRef<TextAreaRef, Props>(
  (
    {
      label,
      value = '',
      bindValue,
      placeholder,
      size = 'md',
      color = 'light.600',
      fontWeight = 'bold',
      clear = 'never',
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
    const [_schema, setSchema] = useState<ZodType>(
      schema ??
        z.string({
          required_error: 'Required',
          invalid_type_error: 'Must be a string',
        }),
    );

    // Re-render component if prop 'value' change
    useEffect(() => {
      setValue(value);
      if (bindValue) {
        bindValue(value);
      }
    }, [value]);

    function initAndValidate(
      e: NativeSyntheticEvent<TextInputFocusEventData>,
    ): void {
      if (!init) {
        setInit(true);
      }
      if (validation) {
        validate(e.nativeEvent.text);
      }
    }

    function validate(val?: string): boolean {
      if (!init) {
        setInit(true);
      }

      let result = _schema.safeParse(val ?? _value);

      setError(!result.success);
      setErrorMessages([]);

      if (!result.success) {
        setErrorMessages(result.error.issues.map(issue => issue.message));
      }

      return result.success;
    }

    function getValue(): string {
      return _value;
    }

    useImperativeHandle(ref, () => ({
      validate,
      clearValue,
      updateSchema,
      getValue,
    }));

    function handleChange(val: string) {
      setValue(val);
      if (bindValue) {
        bindValue(val);
      }
      if (init && validation) {
        validate(val);
      }
    }

    function clearValue() {
      setValue('');
      if (bindValue) {
        bindValue('');
      }
    }

    function updateSchema(newSchema: ZodType) {
      setSchema(newSchema);
    }

    return (
      <FormControl isInvalid={error} isRequired={required} {...props}>
        <InputLabel label={label} />
        <TextArea
          onBlur={initAndValidate}
          onChangeText={handleChange}
          clearButtonMode={clear}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          clearTextOnFocus={secureTextEntry}
          InputLeftElement={<InputIcon icon={icon} />}
          value={_value}
          placeholder={placeholder ? placeholder : ''}
          _focus={{ borderColor: 'violet.700', bg: 'fuchsia.100' }}
          color={color}
          fontWeight={fontWeight}
          size={size}
          autoCompleteType={undefined}
        />
        <ValidationErrors error={error} errorMessages={errorMessages} />
      </FormControl>
    );
  },
);

export default TextAreaInput;
