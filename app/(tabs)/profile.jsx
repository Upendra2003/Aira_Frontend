import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import React from 'react';
import { useAuthStore } from '../../utils/authStore';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useStreakStore } from '../../utils/streakStore';


const Profile = () => {
  const { LogOut ,username,email} = useAuthStore();
  const router = useRouter();
  
  const streakData = useStreakStore((state) => state.streakData);

  // Example user details (replace with actual auth data)
  const user = {
    name: username|| 'John Doe',
    email: email,
    profilePic: 'https://shorturl.at/bgX5u', // Replace with actual image URL
  };


  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View /> {/* Spacer */}
      </View>
  
      <ScrollView contentContainerStyle={styles.container}>
  
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: user.profilePic }} style={styles.profileImage} />
          <View style={{ marginLeft: 20 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
  
        {/* Weekly Streak */}
        <View style={styles.streakSection}>
          <Text style={styles.sectionTitle}>Weekly Streak</Text>
          <View style={styles.streakBar}>
            {streakData.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.streakDay,
                  item.active ? styles.activeDay : styles.inactiveDay
                ]}
              >
                <Text style={item.active ? styles.streakDayText : styles.inactiveDayText}>
                  {item.day[0]}
                </Text>
              </View>
            ))}
          </View>
        </View>
  
        {/* Navigation Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/mentalScore')}>
            <Text style={styles.buttonText}>Mental Growth</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/vision')}>
            <Text style={styles.buttonText}>Vision Board</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/story')}>
            <Text style={styles.buttonText}>Your Story</Text>
          </TouchableOpacity>
        </View>
  
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={LogOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
  
      </ScrollView>
    </View>
  );
  
};

export default Profile;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  streakSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  streakBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakDay: {
    width: 30,
    height: 30,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginHorizontal: 4,
  },
  activeDay: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  inactiveDay: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  },
  streakDayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inactiveDayText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSection: {
    marginBottom: 30,
  },
  navButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 15,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
