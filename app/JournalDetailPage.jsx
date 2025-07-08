import {React,useLayoutEffect} from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter,useNavigation } from 'expo-router';

const formatTime = (datetimeString) => {
  const date = new Date(datetimeString);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
};


export default function JournalDetailPage() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown:false
    });
  }, [navigation]);



  const { journal } = useLocalSearchParams();
  const router = useRouter();

  if (!journal) return <Text>Loading...</Text>;

  const parsedJournal = JSON.parse(journal);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{parsedJournal.title}</Text>
      <FlatList
  data={parsedJournal.messages}
  keyExtractor={(_, index) => index.toString()}
  renderItem={({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'User' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {item.role === 'User' ? (
        <Text style={styles.userText}>{item.content}</Text>
      ) : (
        // For AI, render each chunk separately
        item.message_chunks.map((chunk, idx) => (
          <Text key={idx} style={styles.aiText}>
            {chunk}
          </Text>
        ))
      )}
      <Text style={styles.time}>{formatTime(item.created_at)}</Text>
    </View>
  )}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#F9FAFB' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  messageContainer: { marginBottom: 10, padding: 10, borderRadius: 10, maxWidth: '80%',flexDirection: 'column' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#4F46E5' },
  aiMessage: { alignSelf: 'flex-start', backgroundColor: '#E5E7EB' },
  userText: { color: '#fff' },
  aiText: { color: '#000' },
  time: { fontSize: 10, color: '#999', marginTop: 4, textAlign: 'right' },
});
