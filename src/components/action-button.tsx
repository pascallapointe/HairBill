import React, { ReactElement, useEffect, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button, IButtonProps } from 'native-base';
import { useTranslation } from 'react-i18next';

interface Props extends IButtonProps {
  text: string;
  icon?: ReactElement;
  customStyle?: StyleProp<ViewStyle>;
  action: () => Promise<void>;
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

  useEffect(() => {
    if (wait) {
      action()
        .catch(console.error)
        .finally(() => setWait(false));
    }
  }, [wait]);

  function triggerAction(): void {
    setWait(true);
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
