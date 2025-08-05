import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from "react-i18next";

function ChatScreen() {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{t('Chat Screen')}</Text>
    </View>
  );
}

export default ChatScreen;
