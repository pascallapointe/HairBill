import React from 'react';
import {
  FormControl,
  IFormControlErrorMessageProps,
  WarningOutlineIcon,
} from 'native-base';
import { FlatList } from 'react-native';

interface errorProps extends IFormControlErrorMessageProps {
  item: string;
}

const ErrorMessage: React.FC<errorProps> = ({ item, ...props }) => (
  <FormControl.ErrorMessage
    {...props}
    _text={{ fontSize: 'sm' }}
    leftIcon={<WarningOutlineIcon size="xs" />}>
    {item}
  </FormControl.ErrorMessage>
);

interface Props extends IFormControlErrorMessageProps {
  error: boolean;
  errorMessages: string[];
}

const ValidationErrors: React.FC<Props> = ({
  error,
  errorMessages,
  ...props
}) => {
  if (error && errorMessages.length > 1) {
    return <FlatList data={errorMessages} renderItem={ErrorMessage} />;
  }
  if (error && errorMessages.length === 1) {
    return <ErrorMessage item={errorMessages[0]} {...props} />;
  }

  return null;
};

export default ValidationErrors;
