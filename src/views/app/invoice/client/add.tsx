import React, { useRef, useState } from 'react';
import { Button, HStack, Text, VStack } from 'native-base';
import { z } from 'zod';
import TextInput, { InputRef } from '@components/form/text-input';
import { useTranslation } from 'react-i18next';
import {
  addClient,
  ClientType,
} from '@views/app/invoice/client/client.repository';
import ActionButton from '@components/action-button';
import Modal, { ModalRef } from '@components/modal';

const AddClient: React.FC<{
  setView: (view: 'list' | 'add') => void;
  value: string;
  bindClient: (client: ClientType) => void;
}> = ({ setView, value, bindClient }) => {
  const { t } = useTranslation();
  const nameField = useRef<InputRef>(null);
  const [name, setName] = useState(value);
  const phoneField = useRef<InputRef>(null);
  const [phone, setPhone] = useState('');
  const [wait, setWait] = useState(false);

  // Modals
  const errorModal = useRef<ModalRef>(null);

  function save() {
    const fields = [
      nameField.current && nameField.current.validate(),
      phoneField.current && phoneField.current.validate(),
    ];
    if (fields.every(field => field)) {
      setWait(true);
      const client = addClient({ name, phone });
      bindClient(client);
      setView('list');
      setWait(false);
    }
  }

  return (
    <VStack p={2} alignItems="center" justifyContent="center" height="250px">
      <TextInput
        maxW="300px"
        ref={nameField}
        value={value}
        bindValue={setName}
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
        ref={phoneField}
        required={false}
        bindValue={setPhone}
        label={t<string>('invoice.clientPhone')}
        placeholder="(999) 999-9999"
        clear="while-editing"
        schema={z.string({
          required_error: t<string>('validation.required'),
        })}
      />

      <HStack my={4} justifyContent="center" space={2}>
        <Button onPress={() => setView('list')} colorScheme="muted" shadow={4}>
          {t<string>('cancel')}
        </Button>
        <ActionButton
          text={t<string>('save')}
          action={save}
          wait={wait}
          colorScheme="violet"
          shadow={4}
        />
      </HStack>
      <Modal
        ref={errorModal}
        hideAction={true}
        callback={() => setWait(false)}
        title={t('modal.defaultErrorTitle')}>
        <Text fontSize="md" textAlign="center">
          {t('modal.defaultErrorMessage')}
        </Text>
      </Modal>
    </VStack>
  );
};

export default AddClient;
