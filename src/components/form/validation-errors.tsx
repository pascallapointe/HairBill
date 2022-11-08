import React from 'react';
import { FormControl, WarningOutlineIcon } from 'native-base';
import { FlatList } from 'react-native';

const ErrorMessage: React.FC<{ item: string }> = ({ item }) => (
  <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
    {item}
  </FormControl.ErrorMessage>
);

const ValidationErrors: React.FC<{
  error: boolean;
  errorMessages: string[];
}> = ({ error, errorMessages }) => {
  if (error && errorMessages.length > 1) {
    return <FlatList data={errorMessages} renderItem={ErrorMessage} />;
  }
  if (error && errorMessages.length === 1) {
    return <ErrorMessage item={errorMessages[0]} />;
  }

  return null;
};

export default ValidationErrors;
