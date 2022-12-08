import React, {
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useImperativeHandle,
  useState,
} from 'react';
import { Modal as NBModal, Button, IModalProps } from 'native-base';
import { StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import ActionButton from '@components/action-button';

interface Props extends IModalProps {
  title: string;
  action?: () => Promise<any>; // Customizable action. Modal must be close explicitly
  actionAutoClose?: boolean;
  callback?: () => void; // Always called on modal close
  actionBtnText?: string;
  actionBtnStyles?: StyleProp<ViewStyle>;
  closeBtnText?: string;
  hideClose?: boolean;
  hideAction?: boolean;
  outClick?: boolean;
  modalType?: 'success' | 'warning' | 'error';
  keyboardShouldPersistTaps?:
    | boolean
    | 'always'
    | 'never'
    | 'handled'
    | undefined;
  children: ReactNode;
}

export type ModalRef = {
  open: () => void;
  close: () => void;
};

const color = {
  success: 'purple.400',
  warning: 'amber.400',
  error: 'rose.400',
};

const Modal = forwardRef<ModalRef, PropsWithChildren<Props>>(
  (
    {
      children,
      title,
      action,
      actionAutoClose = true,
      callback,
      actionBtnText,
      actionBtnStyles,
      closeBtnText,
      hideAction,
      hideClose,
      outClick = true,
      modalType = 'success',
      keyboardShouldPersistTaps = 'always',
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [_isOpen, setIsOpen] = React.useState(false);
    const [wait, setWait] = useState(false);

    const open = () => setIsOpen(true);
    const close = () => {
      if (callback) {
        callback();
      }
      setIsOpen(false);
      setWait(false);
    };
    const triggerAction = async () => {
      setWait(true);
      if (action) {
        await action();
        setWait(false);
      }
      if (actionAutoClose) {
        close();
      }
    };
    useImperativeHandle(ref, () => ({ open, close }));

    const cancelRef = React.useRef(null);

    return (
      <NBModal
        isOpen={_isOpen}
        onClose={close}
        closeOnOverlayClick={outClick}
        {...props}>
        <NBModal.Content>
          <NBModal.CloseButton />
          <NBModal.Header bgColor={color[modalType]}>{title}</NBModal.Header>
          <NBModal.Body
            _scrollview={{
              keyboardShouldPersistTaps: keyboardShouldPersistTaps,
            }}>
            {children}
          </NBModal.Body>
          <NBModal.Footer>
            <Button.Group space={2}>
              <Button
                display={hideClose ? 'none' : 'flex'}
                variant="outline"
                colorScheme="coolGray"
                onPress={close}
                ref={cancelRef}>
                {closeBtnText || t('modal.defaultCloseText')}
              </Button>
              <ActionButton
                minW="80px"
                display={hideAction ? 'none' : 'flex'}
                text={actionBtnText || t('modal.defaultActionText')}
                colorScheme="violet"
                style={actionBtnStyles}
                wait={wait}
                action={triggerAction}
              />
            </Button.Group>
          </NBModal.Footer>
        </NBModal.Content>
      </NBModal>
    );
  },
);

export default Modal;
