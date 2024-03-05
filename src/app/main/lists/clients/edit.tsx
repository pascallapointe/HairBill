import React, { RefObject } from 'react';
import { VStack } from 'native-base';
import { z } from 'zod';
import TextInput, { InputRef } from '@components/form/text-input';
import { useTranslation } from 'react-i18next';
import { ClientType } from '@app/main/invoice/client/client.repository';

const EditClient: React.FC<{
  client?: ClientType;
  nameField: RefObject<InputRef>;
  phoneField: RefObject<InputRef>;
}> = ({ client = { id: '', name: '', phone: '' }, nameField, phoneField }) => {
  const { t } = useTranslation();

  return (
    <VStack p={2} alignItems="center" justifyContent="center">
      <TextInput
        maxW="300px"
        ref={nameField}
        size={{ md: 'md', lg: 'sm' }}
        value={client?.name}
        label={t<string>('invoice.clientName')}
        placeholder={t<string>('invoice.clientName')}
        clear="while-editing"
        schema={z
          .string({
            required_error: t<string>('validation.required'),
          })
          .min(3, { message: t<string>('validation.min', { count: 3 }) })}
      />
      <TextInput
        maxW="300px"
        size={{ md: 'md', lg: 'sm' }}
        ref={phoneField}
        required={false}
        value={client?.phone}
        label={t<string>('invoice.clientPhone')}
        placeholder="(999) 999-9999"
        clear="while-editing"
        schema={z.string({
          required_error: t<string>('validation.required'),
        })}
      />
    </VStack>
  );
};

export default EditClient;
