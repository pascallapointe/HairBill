import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Icon, Text, VStack } from 'native-base';
import TextInput, { InputRef } from '@components/form/text-input';
import Modal, { ModalRef } from '@components/modal';
import ActionButton from '@components/action-button';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  addProduct,
  ProductType,
  updateProduct,
} from '@views/app/services/product/product.repository';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {
  CategoryType,
  getCategories,
} from '@views/app/services/category/category.repository';
import Select, { SelectRef } from '@components/form/select';
import { roundTo } from '@lib/utils';
import { ProductViewType } from '@views/app/services/product/product-view';

interface Props {
  product?: ProductType;
  setParentView: Dispatch<SetStateAction<ProductViewType>>;
}

const EditView: React.FC<Props> = ({ product, setParentView }) => {
  const { t } = useTranslation();
  const nameField = useRef<InputRef>(null);
  const [name, setName] = useState<string>(product?.name ?? '');
  const priceField = useRef<InputRef>(null);
  const [price, setPrice] = useState<number>(product?.price ?? 0);
  const categoryField = useRef<SelectRef>(null);
  const [category, setCategory] = useState<CategoryType | null>(
    product?.category ?? null,
  );
  const [wait, setWait] = useState(false);
  const errorModal = useRef<ModalRef>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState<CategoryType[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e: any) => {
        setErrorMessage(t<string>(e.message ?? 'exception.database'));
        errorModal.current && errorModal.current.open();
      });
  }, []);

  function edit() {
    const fields = [
      nameField.current && nameField.current.validate(),
      priceField.current && priceField.current.validate(),
      categoryField.current && categoryField.current.validate(),
    ];
    if (fields.every(field => field)) {
      setWait(true);
      if (product) {
        updateProduct({
          id: product.id,
          name: name.trim(),
          price: roundTo(parseFloat(price.toString().replace(',', '.')), 2),
          category: category ?? { id: 'none', name: '!none' },
        });
        setParentView('list');
      } else {
        addProduct({
          name: name.trim(),
          price: roundTo(parseFloat(price.toString().replace(',', '.')), 2),
          category: category ?? { id: 'none', name: '!none' },
        });
        setParentView('list');
      }
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
          value={product?.name}
          bindValue={setName}
          label={t<string>('services.newProduct')}
          placeholder={t<string>('services.productName')}
          clear="while-editing"
          schema={z
            .string({
              required_error: t<string>('validation.required'),
            })
            .min(1, { message: t<string>('validation.min', { count: 1 }) })}
        />
        <TextInput
          ref={priceField}
          value={product?.price.toString()}
          bindValue={setPrice}
          keyboardType="decimal-pad"
          label={t<string>('services.price')}
          placeholder="0.00"
          icon={<Icon as={FontAwesome5Icon} name="dollar-sign" />}
          clear="while-editing"
          schema={z.preprocess(
            val => parseFloat((val as string).toString().replace(',', '.')),
            z
              .number({
                required_error: t<string>('validation.required'),
                invalid_type_error: t<string>('validation.numberType'),
              })
              .nonnegative({ message: t<string>('validation.positive') }),
          )}
        />
        <Select
          maxHeight="180px"
          ref={categoryField}
          defaultSelection={
            product && product.category.id !== 'none'
              ? product.category
              : undefined
          }
          bindValue={setCategory}
          label={t('services.category')}
          options={categories}
        />
        <ActionButton
          size="lg"
          text={t('save')}
          action={edit}
          wait={wait}
          colorScheme="violet"
        />
      </VStack>
      <Modal
        ref={errorModal}
        hideAction={true}
        callback={() => setWait(false)}
        title={t('exception.operationFailed')}
        modalType="error">
        <Text fontSize="md" textAlign="center">
          {errorMessage}
        </Text>
      </Modal>
    </>
  );
};

export default EditView;
