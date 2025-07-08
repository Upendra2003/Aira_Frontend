// import { View,TouchableOpacity,Text } from 'react-native'
// import React from 'react'
// import { useAuthStore } from '@/utils/authStore';
// const assessment = () => {
//     const {Assessed} = useAuthStore()
//   return (
//     <View>
//       <Text
//       style={{
//         fontSize: 20,
//         fontWeight: 'bold',
//         textAlign: 'center',
//         marginTop: 20,
//         color: '#333'
//       }}>assessment</Text>
//       <TouchableOpacity
//       style={{
//         backgroundColor: '#4CAF50',
//         padding: 10,
//         borderRadius: 5,
//         margin: 20,
//         alignItems: 'center'
//       }}
//       onPress={Assessed}>
//         <Text
//         style={{
//             color: '#fff',
//             fontSize: 16,
//             fontWeight: '600'
//         }}>Click here to submit assignment</Text>
//       </TouchableOpacity>
//     </View>
//   )
// }

// export default assessment


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '../utils/authStore';
import { personalQuestions, mentalHealthQuestions, mentalHealthOptions } from '../utils/questions';
import { API_URL } from '../utils/apiConfig';

const Assessment = () => {
  const {token,Assessed,LogOut} = useAuthStore();
  const [answers, setAnswers] = useState([]);
  const [personalInfo, setPersonalInfo] = useState({});
  
  const handleChange = (key, value) => {
    setPersonalInfo({ ...personalInfo, [key]: value });
  };

  const handleSubmit = async () => {
    let finalAnswers = [];

    // Add personal answers in correct order
    finalAnswers.push(
      personalInfo.name || '',
      personalInfo.age || '',
      personalInfo.gender || '',
      personalInfo.occupation || '',
      personalInfo.occupation === 'Working Professional' ? (personalInfo.income || '') : '',
      personalInfo.education || '',
      personalInfo.hobbies || ''
    );

    // Add mental health answers
    finalAnswers = [...finalAnswers, ...answers];

    try {
      const response = await fetch(`${API_URL}/assessment/mental_health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: finalAnswers })
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Assessment submitted successfully!');
        Assessed()
        console.log(result);
      } else {
        Alert.alert('Error', result.message || 'Submission failed');
        console.log(JSON.stringify({ answers: finalAnswers }));
        LogOut();
      }
    } catch (error) {
      Alert.alert('Network Error', error.message);
      
    }
  };

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#F9FAFB' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color:"black" }}>Personal Questions</Text>

      {personalQuestions.map((q, index) => {
        if (q.occupationDependent && personalInfo.occupation !== 'Working Professional') {
          return null;
        }

        if (q.type === 'text' || q.type === 'number') {
          return (
            <View key={index} style={{ marginBottom: 15 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 5,
                color: 'black'
              }}>{q.question}</Text>
              <TextInput
                style={{ borderWidth: 1, padding: 8, borderRadius: 5 , color: 'black'}}
                keyboardType={q.type === 'number' ? 'numeric' : 'default'}
                onChangeText={(text) => handleChange(q.id, text)}
              />
            </View>
          );
        }

        if (q.type === 'picker') {
          return (
            <View key={index} style={{ marginBottom: 15 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 5,
                color: 'black'
              }} >{q.question}</Text>
              <Picker
                selectedValue={personalInfo[q.id]}
                onValueChange={(itemValue) => handleChange(q.id, itemValue)}
                style={{ height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, color: 'black' }}
                
              >
                <Picker.Item label="Select an option" value="" />
                {q.options.map((option, i) => (
                  <Picker.Item label={option} value={option} key={i} />
                ))}
              </Picker>
            </View>
          );
        }
      })}

      <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 20 }}>Mental Health Questions</Text>

      {mentalHealthQuestions.map((question, index) => (
        <View key={index} style={{ marginBottom: 15 }}>
          <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
            color: 'black'
          }}>{question}</Text>
          <Picker
            selectedValue={answers[index]}
            style={{ height: 50, borderWidth: 2, borderColor: '#ccc', borderRadius: 5, color: 'black' }}
            onValueChange={(value) => {
              const updatedAnswers = [...answers];
              updatedAnswers[index] = value;
              setAnswers(updatedAnswers);
            }}
          >
            <Picker.Item label="Select an option" value="" 
            />
            {mentalHealthOptions.map((option, i) => (
              <Picker.Item label={option} value={option.toLowerCase()} key={i} />
            ))}
          </Picker>
        </View>
      ))}

      <TouchableOpacity
        style={{ backgroundColor: '#4F46E5', margin:30, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 }}
        onPress={handleSubmit}
      >
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Submit Assessment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Assessment;
