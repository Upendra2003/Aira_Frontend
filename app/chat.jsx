import React, { useState, useRef,useEffect,useLayoutEffect  } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,Keyboard,TouchableWithoutFeedback,FlatList,Platform,KeyboardAvoidingView,RefreshControl} from 'react-native';
import { useChatStore } from '../utils/chatStore';
import { useAuthStore } from '../utils/authStore';
import { useNavigation,useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';

import { API_URL } from '../utils/apiConfig'; // Import your API URL


export default function ChatPage() {
  const { token } = useAuthStore();
  const { messages, addMessage, removeMessageByTypingId,setMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(40); // default height
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const inputRef = useRef<TextInput>(null);  // ✅ Correct input ref
  const keyboardTimer = useRef(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [olderMessages, setOlderMessages] = useState([]);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown:false
    });
  }, [navigation]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
    fetchMessages();  
    sendWelcomeBackMessage();
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      clearTimeout(keyboardTimer.current);
    };
  }, []);

  const onRefresh= async () => {
    setRefreshing(true)
    await  fetchMessages(); 
    setRefreshing(false)
  }


  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/get_messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Assume API returns messages from oldest to newest
        // Split older messages and latest 4
        const totalMessages = result.messages;
        const older = totalMessages.slice(0, -4);
        const recent = totalMessages.slice(-4);
  
        setOlderMessages(older);   // Keep older messages in component state
        setMessages(recent);       // Keep last 4 messages in Zustand store
  
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        console.error('Failed to fetch messages:', result.message);
      }
    } catch (error) {
      console.error('Network error while fetching messages:', error.message);
    }
  };
  
  const sendWelcomeBackMessage = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/welcome_back`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Directly add the welcome message to the chat
        for (let chunk of result.message_chunks) {
          addMessage({ role: 'AI', message: chunk });
          scrollToBottom();
        }
      } else {
        console.error('Failed to fetch welcome message:', result.message);
      }
    } catch (error) {
      console.error('Error fetching welcome message:', error.message);
    }
  };
  

  const handleKeyboardShow = () => {
    setIsKeyboardOpen(true);

    // Start 30-second timer
    keyboardTimer.current = setTimeout(() => {
      sendTypingFlag();
    }, 60 * 1000);
  };

  const handleKeyboardHide = () => {
    setIsKeyboardOpen(false);
    clearTimeout(keyboardTimer.current); // Cancel the timer if the keyboard is dismissed
  };

  const sendTypingFlag = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/check_typing_flag`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok)  {
        console.log('Typing flag set :', result);
        for (let chunk of result.message_chunks) {
          addMessage({ role: 'AI', message: chunk });
          scrollToBottom();
        }
      }  else {
        console.error('Failed to set typing flag:', result.message);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };


  const handleSend = async () => {
    if (!input.trim()) return;

    addMessage({ role: 'User', message: input });
    const userMessage = input;
    setInput('');
    setIsLoading(true);
    scrollToBottom();
  // ✅ Manually focus again to keep keyboard open
  setTimeout(() => {
    inputRef.current?.focus();
  }, 100);

    // ✅ Add "typing..." message with a unique flag
    const typingId = Date.now(); // Unique ID for this typing message
    addMessage({ role: 'AI', message: 'typing...', typingId });
  

    try {
      const response = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const result = await response.json();

      if (response.ok) {
        // ✅ Remove "typing..." message before adding real messages
      removeMessageByTypingId(typingId);

        for (let chunk of result.message_chunks) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          addMessage({ role: 'AI', message: chunk });
          scrollToBottom();
        }
      } else {
        addMessage({ role: 'AI', message: 'Error: ' + (result.message || 'Something went wrong.') });
      }
    } catch (error) {
      addMessage({ role: 'AI', message: 'Network error: ' + error.message });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 40} // Adjust based on your layout
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              {/* <Text style={styles.backButton}>{"<"}</Text> */}
              <AntDesign name="arrowleft" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Aira</Text>
          </View>
         
          <FlatList
  ref={flatListRef}
  data={[...olderMessages, ...messages]}  // Show older + local messages
  keyExtractor={(_, index) => index.toString()}
  renderItem={({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'User' ? styles.userMessage : styles.aiMessage,
      ]}
    >
{item.role === 'AI' ? (
  <>
    {item.message_chunks && item.message_chunks.length > 0 ? (
      item.message_chunks.map((chunk, index) => (
        <Text key={index} style={styles.aimessageText}>
          {chunk}
        </Text>
      ))
    ) : (
      <Text style={styles.aimessageText}>
        {item.message}
      </Text>
    )}
    {scrollToBottom()}
  </>
) : (
  <Text style={styles.usermessageText}>
    {item.content|| item.message}
  </Text>
)}


    </View>
  )}
  style={{ flex: 1 }}
  contentContainerStyle={{ padding: 10 }}
  keyboardShouldPersistTaps="handled"
  extraScrollHeight={20}
  onEndReachedThreshold={0.2}
  refreshControl={
    <RefreshControl
    refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#4F46E5']}
      tintColor="#4F46E5"
    />
  }
/>

   
<View style={styles.inputContainer}>
      <TextInput
        ref={inputRef}
        style={[styles.input, { height: Math.max(40, inputHeight) }]}
        placeholder="Type your message..."
        value={input}
        onChangeText={setInput}
        multiline={true}
        onContentSizeChange={(event) =>
          setInputHeight(event.nativeEvent.contentSize.height)
        }
        editable={!isLoading}
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSend}
        disabled={isLoading}
      >
        <Text style={styles.sendButtonText}>{isLoading ? '...' : 'Send'}</Text>
      </TouchableOpacity>
    </View>
    
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB',scrollable: true },
  header: {
    height: 60,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: { color: '#fff', fontSize: 24 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' ,paddingLeft: 10},
  messageContainer: { marginBottom: 10, padding: 10, borderRadius: 10, maxWidth: '80%' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#4F46E5'},
  aiMessage: { alignSelf: 'flex-start', backgroundColor: '#E5E7EB' },
  aimessageText: { color: '#000' },
  usermessageText: { color: '#fff' },
  inputContainer: { flexDirection: 'row', padding: 10  , borderTopWidth: 1, borderColor: '#ccc' },
  input: { flex: 1,width:'80%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 15 },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 10,
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});