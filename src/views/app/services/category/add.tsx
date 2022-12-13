import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { Button, VStack } from 'native-base';
import TextInput, { InputRef } from '@components/form/text-input';
import { addCategory } from '@views/app/services/category/category.repository';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface Props {
  setParentView: Dispatch<SetStateAction<'add' | 'list'>>;
}

const AddView: React.FC<Props> = ({ setParentView }) => {
  const { t } = useTranslation();
  const nameField = useRef<InputRef>(null);
  const [value, setValue] = useState('');

  async function add(): Promise<void> {
    const fields = [nameField.current && nameField.current.validate()];
    if (fields.every(field => field)) {
      addCategory(value.trim());
      setParentView('list');
    }
  }

  return (
    <>
      <VStack
        maxHeight={{ md: '380px', lg: '497px' }}
        px={5}
        pb={5}
        space={4}
        alignItems="center">
        <TextInput
          ref={nameField}
          bindValue={setValue}
          label={t<string>('services.newCategory')}
          placeholder={t<string>('services.categoryName')}
          clear="while-editing"
          schema={z
            .string({
              required_error: t<string>('validation.required'),
            })
            .min(1, { message: t<string>('validation.min', { count: 1 }) })}
        />
        <Button size="lg" onPress={add} colorScheme="violet">
          {t('save')}
        </Button>
      </VStack>
    </>
  );
};

export default AddView;
