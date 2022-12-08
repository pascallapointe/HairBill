import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
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
import {
  HostComponent,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import type { ThemeComponentSizeType } from 'native-base/lib/typescript/components/types';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import ClientList from '@views/app/invoice/client/list';
import AddClient from '@views/app/invoice/client/add';
import { ClientType } from '@views/app/invoice/client/client.repository';

export const defaultClient = {
  id: '',
  name: '',
  phone: '',
};

interface Props extends IFormControlProps {
  label?: string;
  value?: string;
  placeholder?: string;
  size?: ThemeComponentSizeType<'Input'>;
  color?: string;
  fontWeight?: string;
  required?: boolean;
  validation?: boolean;
  schema?: ZodType;
  icon?: JSX.Element;
}

export type ClientInputRef = {
  validate: (val?: string) => void;
  getValue: () => ClientType;
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

const ClientInput = forwardRef<ClientInputRef, Props>(
  (
    {
      label,
      value = '',
      placeholder,
      size = 'md',
      color = 'light.600',
      fontWeight = 'bold',
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
    const [_value, setValue] = useState<ClientType>({
      ...defaultClient,
      name: value,
    });
    const inputField = useRef<React.ElementRef<HostComponent<unknown>>>(null);
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

      let result = schema.safeParse(val ?? _value.name);

      setError(!result.success);
      setErrorMessages([]);

      if (!result.success) {
        setErrorMessages(result.error.issues.map(issue => issue.message));
      }

      return result.success;
    }

    function getValue(): ClientType {
      return _value;
    }

    useImperativeHandle(ref, () => ({ validate, getValue }));

    function handleChange(val: string) {
      if (val.length >= 3) {
        setIsOpen(true);
      }
      setValue({ ...defaultClient, name: val });
      if (init && validation) {
        validate(val);
      }
    }

    function selectClient(client: ClientType) {
      setValue(client);
      setIsOpen(false);
      inputField.current && inputField.current.blur();
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
          ref={inputField}
          onFocus={e => {
            setView('list');
            setIsOpen(true);

            // Workaround for selectTextOnFocus={true} not working
            e.currentTarget.setNativeProps({
              selection: { start: 0, end: _value.name.length },
            });
          }}
          onBlur={e => {
            initAndValidate(e);
          }}
          onSubmitEditing={() => setIsOpen(false)}
          onChangeText={handleChange}
          clearButtonMode="while-editing"
          autoComplete="off"
          autoCorrect={false}
          autoCapitalize="words"
          InputLeftElement={<InputIcon icon={icon} />}
          value={_value.name}
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
                query={_value.name}
                bindClient={selectClient}
              />
            ) : (
              <AddClient
                setView={setView}
                value={_value.name}
                bindClient={selectClient}
              />
            )}
            <Button
              onPress={() => {
                setIsOpen(false);
                setView('list');
                inputField.current && inputField.current.blur();
              }}
              variant="ghost"
              colorScheme="danger"
              position="absolute"
              zIndex={100}
              right={0}
              top={0}>
              <Icon
                bottom="1px"
                left="2px"
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

export default ClientInput;
