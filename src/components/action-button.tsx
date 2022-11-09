import React, { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { Button, IButtonProps } from 'native-base';
import { useTranslation } from 'react-i18next';

interface Props extends IButtonProps {
  text: string;
  icon?: ReactElement;
  wait?: boolean;
  customStyle?: StyleSheet.NamedStyles<any>;
  action: () => void;
}

const ActionButton: React.FC<React.PropsWithChildren<Props>> = ({
  text,
  icon,
  wait = false,
  customStyle,
  action = () => null,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <Button
      minW="140px"
      isLoading={wait}
      onPress={action}
      startIcon={icon}
      style={customStyle}
      shadow={5}
      isLoadingText={t('waitButton')}
      {...props}>
      {text}
    </Button>
  );
};

export default ActionButton;
