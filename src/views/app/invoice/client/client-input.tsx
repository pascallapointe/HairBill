import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { z, ZodType } from 'zod';
import {
  Box,
  Button,
  FormControl,
  Icon,
  IFormControlProps,
  Input,
} from 'native-base';
import ValidationErrors from '@components/form/validation-errors';
import type {
  AutoCapitalizeType,
  AndroidAutoCompleteType,
  iOSClearButtonModeType,
  KeyboardType,
} from '@type/form.type';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import type { ThemeComponentSizeType } from 'native-base/lib/typescript/components/types';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import ClientList from '@views/app/invoice/client/list';
import AddClient from '@views/app/invoice/client/add';
import { ClientType } from '@views/app/invoice/client/client.repository';

interface Props extends IFormControlProps {
  bindValue: (val: ClientType) => void;
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

export type ClientInputRef = {
  validate: (val?: string) => void;
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

const TextInput = forwardRef<ClientInputRef, Props>(
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
      autoComplete = 'off',
      autoCorrect = false,
      autoCapitalize = 'words',
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
    // Input properties
    const [init, setInit] = useState(false);
    const [_value, setValue] = useState(value);
    const [error, setError] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    // Popover properties
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'list' | 'add'>('list');

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

      let result = schema.safeParse(val ?? _value);

      setError(!result.success);
      setErrorMessages([]);

      if (!result.success) {
        setErrorMessages(result.error.issues.map(issue => issue.message));
      }

      return result.success;
    }

    useImperativeHandle(ref, () => ({ validate }));

    function handleChange(val: string) {
      setIsOpen(true);
      setValue(val);
      bindValue({ id: '', name: val, phone: '' });
      if (init && validation) {
        validate(val);
      }
    }

    function selectClient(client: ClientType) {
      setValue(client.name);
      bindValue(client);
      setIsOpen(false);
    }

    return (
      <FormControl isInvalid={error} isRequired={required} {...props}>
        <InputLabel label={label} />
        <ValidationErrors
          m={0}
          mb={1}
          error={error}
          errorMessages={errorMessages}
        />
        <Input
          onFocus={() => {
            setView('list');
          }}
          onBlur={e => {
            initAndValidate(e);
          }}
          onChangeText={handleChange}
          clearButtonMode={clear}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          clearTextOnFocus={secureTextEntry}
          InputLeftElement={<InputIcon icon={icon} />}
          value={_value}
          placeholder={placeholder ? placeholder : ''}
          _focus={{
            borderColor: 'violet.700',
            bg: 'fuchsia.100',
          }}
          color={color}
          fontWeight={fontWeight}
          size={size}
        />
        <Box width="100%" display={isOpen ? 'flex' : 'none'}>
          <Box
            position="absolute"
            zIndex={10}
            bgColor="white"
            rounded={4}
            shadow={5}
            width="100%"
            borderWidth={1}
            borderColor="violet.700">
            {view === 'list' ? (
              <ClientList
                setView={setView}
                query={_value}
                bindClient={selectClient}
              />
            ) : (
              <AddClient
                setView={setView}
                value={_value}
                bindClient={selectClient}
              />
            )}
            <Button
              onPress={() => {
                setIsOpen(false);
                setView('list');
              }}
              variant="unstyled"
              position="absolute"
              zIndex={100}
              right={0}
              top={0}>
              <Icon
                size="md"
                as={FontAwesomeIcon}
                name="close"
                color="violet.700"
              />
            </Button>
          </Box>
        </Box>
      </FormControl>
    );
  },
);

export default TextInput;
