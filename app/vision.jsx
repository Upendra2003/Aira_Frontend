import React, { useState, useLayoutEffect, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator,Alert } from 'react-native';
import WordCloud from 'rn-wordcloud';
import { useNavigation } from 'expo-router';
import { API_URL } from '@/utils/apiConfig';
import { useAuthStore } from '@/utils/authStore'; // Ensure this path is correct

export default function Vision() {
  const [words, setWords] = useState([{name:'one',value:'3'},{name:'two',value:'3'}]);
  const [modalVisible, setModalVisible] = useState(false);
  const { token } = useAuthStore();
  const [newWord, setNewWord] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    try {
     const response = await fetch(`${API_URL}/user/profile`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
      const data = await response.json();
      const id = data.profile.user_id;
      setUserId(id);
      fetchGoals(id);
    } catch (error) {
      console.error('Error fetching user ID:', error);
      setLoading(false);
    }
  };

  const fetchGoals = async (user_id) => {
    try {
      const response = await fetch(`${API_URL}/visionboard/get_goals?user_id=${user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch goals');
      }

      const formattedGoals = data.goals.map(goal => ({ text: goal.text, value: goal.value,id: goal.id }));
      setWords(formattedGoals);
      console.log('Formatted goals:', words);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      alert('Please enter a valid word');
      return;
    }
  
    const randomValue = Math.floor(Math.random() * 10) + 5;
  
    try {
      const response = await fetch(`${API_URL}/visionboard/add_custom_goal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          goal: newWord.trim(),
          value: randomValue,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add goal');
      }
  
      // If success, add to local word cloud
      const wordToAdd = { text: newWord.trim(), value: randomValue };
      setWords([...words, wordToAdd]);
      setNewWord('');
      setModalVisible(false);
      console.log('New word added and synced to backend:', wordToAdd);
    } catch (error) {
      console.error('Error adding word:', error);
      alert('Failed to add word. Please try again.');
    }
  };
  
  const deleteWord = async (word) => {
    try {
      const goalToDelete = words.find(item => item.text === word.text);
      if (!goalToDelete) return;
  
      const response = await fetch(`${API_URL}/visionboard/delete_goal`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          goal_id: goalToDelete.id, // You must track the `id` when loading goals
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }
  
      // Update local word list
      const updatedWords = words.filter(item => item.text !== word.text);
      setWords(updatedWords);
  
      console.log(`Deleted "${word.text}" successfully`);
    } catch (error) {
      console.error('Error deleting word:', error);
      alert('Failed to delete the word. Please try again.');
    }
  };
  


  const handleWordClick = (word) => {
    Alert.alert(
      'Delete Word',
      `Do you want to delete "${word.text}" from your vision board?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteWord(word) },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f9f9f9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 40}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
  
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>✨ Vision Board ✨</Text>
          </View>
  
          {/* Word Cloud */}
          <View style={styles.wordCloudContainer}>
          {words.length > 0 ? (
  <WordCloud
    key={words.length}
    options={{
      words: words,
      verticalEnabled: true,
      minFont: 10,
      maxFont: 50,
      fontOffset: 1,
      width: 350,
      height: 700,
      fontFamily: 'Arial',
    }}
    onWordPress={handleWordClick}
  />
) : (
  <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
    No goals yet. Tap "+" to add your first one!
  </Text>
)}

          </View>
  
          {/* Floating Action Button */}
          <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
            <Text style={styles.fabText}>＋</Text>
          </TouchableOpacity>
  
          {/* Modal for Adding Words */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                  <Text style={styles.modalTitle}>Add New Word</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your word"
                    placeholderTextColor="#aaa"
                    value={newWord}
                    onChangeText={setNewWord}
                    onSubmitEditing={handleAddWord}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.modalButton} onPress={handleAddWord}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
  
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  wordCloudContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4F46E5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

