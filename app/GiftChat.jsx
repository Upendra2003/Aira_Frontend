import React, { useState, useEffect, useCallback,useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator,Text} from 'react-native';
import { GiftedChat, InputToolbar, Send, Bubble } from 'react-native-gifted-chat';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuthStore } from '../utils/authStore';
import { API_URL } from '../utils/apiConfig';
import { useRouter,useNavigation } from 'expo-router';

const GiftChat=()=> {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
    const navigation = useNavigation();
    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown:false
      });
    }, [navigation]);

  useEffect(() => {
    fetchMessages();
    sendWelcomeBackMessage();
  }, []);

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
        const giftedMessages = result.messages.map((item, index) => {
          let text = '';
      
          if (item.role === 'User') {
            text = item.content || item.message;
          } else if (item.role === 'AI') {
            if (item.message_chunks && item.message_chunks.length > 0) {
              text = item.message_chunks.join(' '); // Concatenate all chunks with space
            } else {
              text = item.message;
            }
          }
      
          return {
            _id: index + 1,
            text: text,
            createdAt: item.created_at, 
            user: {
              _id: item.role === 'User' ? 1 : 2,
              name: item.role === 'User' ? 'You' : 'Aira',
            },
          };
        }).reverse();
      
        setMessages(giftedMessages);
      }
      
    } catch (error) {
      console.error('Error fetching messages:', error.message);
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

      if (response.ok && result.message_chunks.length > 0) {
        const welcomeMessages = result.message_chunks.map((chunk, index) => ({
          _id: Date.now() + index,
          text: chunk,
          createdAt: new Date(),
          user: { _id: 2, name: 'Aira' },
        }));

        setMessages(previous => GiftedChat.append(previous, welcomeMessages));
      }
    } catch (error) {
      console.error('Error sending welcome back:', error.message);
    }
  };

  const onSend = useCallback(async (newMessages = []) => {
    const userMessage = newMessages[0];
    setMessages(previousMessages => GiftedChat.append(previousMessages, userMessage));
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const result = await response.json();

      if (response.ok && result.message_chunks.length > 0) {
        for (let chunk of result.message_chunks) {
          await new Promise(res => setTimeout(res, 1000)); // simulate typing delay
          const aiMessage = {
            _id: Date.now(),
            text: chunk,
            createdAt: new Date(),
            user: { _id: 2, name: 'Aira' },
          };
          setMessages(previousMessages => GiftedChat.append(previousMessages, aiMessage));
        }
      }
    } catch (error) {
      const errorMessage = {
        _id: Date.now(),
        text: 'Network error: ' + error.message,
        createdAt: new Date(),
        user: { _id: 2, name: 'Aira' },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <View style={styles.container}>
   <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              {/* <Text style={styles.backButton}>{"<"}</Text> */}
              <AntDesign name="arrowleft" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Aira</Text>
          </View>

      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: 1 }}
        renderSend={(props) => (
          <Send {...props}>
            <View style={styles.sendButton}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AntDesign name="arrowright" size={24} color="white" />
              )}
            </View>
          </Send>
        )}
        renderInputToolbar={(props) => (
          <InputToolbar {...props} containerStyle={styles.inputToolbar} />
        )}
        

        renderAvatar={() => null}
showAvatarForEveryMessage={true}

        
    
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: '#4F46E5' , marginBottom: 12, borderTopRightRadius: 2, borderRadius: 15 },
              left: { backgroundColor: '#E5E7EB', marginBottom: 8, borderBottomLeftRadius: 2, borderRadius: 15 },
            }}
            textStyle={{
              right: { color: '#fff', fontSize: 16 },
              left: { color: '#000' , fontSize: 16 },
            }}
          />
        )}
        placeholder="Talk to me..."
        scrollToBottom
        alwaysShowSend
      />
    </View>
  );
}
export default GiftChat;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    height: 60,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: { color: '#fff', fontSize: 24 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' ,paddingLeft: 10},
  sendButton: {
    
    backgroundColor: '#4F46E5',
    borderRadius: 15,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputToolbar: {
    backgroundColor: '#F9FAFB',
    paddingTop:2,
    marginHorizontal: 5,
    marginBottom: 5,
  },
});
