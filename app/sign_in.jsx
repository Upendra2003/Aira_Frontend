import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {Link} from "expo-router"
import {useAuthStore} from '../utils/authStore'
import {API_URL} from '../utils/apiConfig' // Adjust the import path as necessary

const SignIn = () => {
    const {Login} =useAuthStore()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      console.log('Email or password is empty');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Login Success', `Welcome back!`);
        
        // Pass all required data to the store
        Login({
          token: result.access_token,
          refreshToken: result.refresh_token,
          userId: result.user_id,
          username: result.user.username,
          email: result.user.email,
          assessmentFlag: result.assessment_flag,
        });
      
        console.log('Token:', result.access_token); 
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
      }
      
    } catch (error) {
      Alert.alert('Network Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Log in for existing user</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#888"
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
                 <Text style={styles.footerText}>Don't have an account?</Text>
                 <Link style={styles.footerLink} href={'sign_up'}>Sign Up</Link>
               </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  inner: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer:{
    display: 'flex',
     flexDirection: 'row', 
     gap:3,
     paddingTop:5,
     paddingLeft:10
  },
  footerText:{
    fontSize:14,
    fontWeight:300
  },
  footerLink:{
    fontSize:14,
    fontWeight:'bold',
    color:'#4F46E5'

  }
});
