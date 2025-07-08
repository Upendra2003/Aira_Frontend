import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useAuthStore } from '../../utils/authStore';
import { useRouter } from 'expo-router';
import { API_URL } from '../../utils/apiConfig';


export default function JournalPage() {
  const { token } = useAuthStore();
  const [journals, setJournals] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/get_journals`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (response.ok) {
        setJournals(result.journals);
      } else {
        console.error('Failed to fetch journals:', result.message);
      }
    } catch (error) {
      console.error('Error fetching journals:', error);
    }
  };

  const openJournal = (item) => {
    router.push({ pathname: 'JournalDetailPage', params: { journal: JSON.stringify(item) } })
  // Navigate with journal data
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Journals</Text>
      <FlatList
        data={journals}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.journalItem} 
          onPress={() => router.push({ pathname: 'JournalDetailPage', params: { journal: JSON.stringify(item) } })}
          >
            <Text style={styles.journalTitle}>{item.title}</Text>
            <Text style={styles.journalDate}>{item.date}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9FAFB' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  journalItem: { padding: 15, borderBottomWidth: 1, borderColor: '#ddd' },
  journalTitle: { fontSize: 18, fontWeight: 'bold' },
  journalDate: { fontSize: 14, color: '#555' },
});
