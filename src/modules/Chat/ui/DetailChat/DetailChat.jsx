import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { socket } from '../../../../socket/socket';

// Fake data for messages
const fakeMessages = [
  {
    id: '1',
    text: 'Hello! How are you?',
    sender: 'other',
    timestamp: '09:30 AM',
  },
  {
    id: '2',
    text: 'I\'m good, thanks! Check out this photo',
    sender: 'me',
    timestamp: '09:31 AM',
    media: {
      type: 'image',
      uri: 'https://picsum.photos/200/300',
    },
  },
  {
    id: '3',
    text: 'Nice! Here\'s a video from yesterday',
    sender: 'other',
    timestamp: '09:32 AM',
    media: {
      type: 'video',
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
  },
];

function DetailChat({ route , navigation }) {
  const { user } = route.params;
  const { t } = useTranslation();
  const [messages, setMessages] = useState(fakeMessages);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'me' ? styles.myMessage : styles.otherMessage,
      ]}
    >
      {item.media && (
        <View style={styles.mediaContainer}>
          {item.media.type === 'image' ? (
            <Image source={{ uri: item.media.uri }} style={styles.mediaContent} />
          ) : (
            <Video
              source={{ uri: item.media.uri }}
              style={styles.mediaContent}
              useNativeControls
              resizeMode="contain"
            />
          )}
        </View>
      )}
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      socket.emit("new_location_push", { msg: newMessage });
      setMessages([...messages, newMessage]);
      setInputText('');
      flatListRef.current?.scrollToEnd();
    }
  };

  const handleMediaPicker = () => {
    // This will be integrated with CameraScreen later
    console.log('Open media picker');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
        <Text style={styles.headerName}>{user.name}</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
        
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleMediaPicker} style={styles.mediaButton}>
            <Ionicons name="image-outline" size={24} color="#666" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('Type a message...')}
            multiline
          />
          
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={24} color={inputText.trim() ? '#007AFF' : '#CCC'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  messagesList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#48cae4',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    color: '#000',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  mediaContainer: {
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mediaContent: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
  },
  mediaButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default DetailChat;
