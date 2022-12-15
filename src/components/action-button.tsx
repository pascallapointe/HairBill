import React, { ReactElement, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button, IButtonProps } from 'native-base';
import { useTranslation } from 'react-i18next';

interface Props extends IButtonProps {
  text: string;
  icon?: ReactElement;
  customStyle?: StyleProp<ViewStyle>;
  action: () => Promise<boolean>;
}

const ActionButton: React.FC<React.PropsWithChildren<Props>> = ({
  text,
  icon,
  customStyle,
  action,
  ...props
}) => {
  const { t } = useTranslation();
  const [wait, setWait] = useState(false);

  function triggerAction(): void {
    if (!wait) {
      setWait(true);
      action()
        .then(val => (val ? setWait(val) : setWait(false)))
        .catch(console.error);
    }
  }

  return (
    <Button
      isLoading={wait}
      onPress={triggerAction}
      startIcon={icon}
      style={customStyle}
      shadow={5}
      isLoadingText={t<string>('waitButton')}
      {...props}>
      {text}
    </Button>
  );
};

export default ActionButton;
