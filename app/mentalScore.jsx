import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet,ScrollView,Dimensions,TouchableOpacity,ac } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '@/utils/authStore'; // update path as per your project
import { API_URL } from '@/utils/apiConfig'; // update path as per your project
import { useLayoutEffect } from 'react';
import { useNavigation} from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Swiper from 'react-native-deck-swiper';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function MentalScore() {
  const { token } = useAuthStore(); // make sure this returns the correct token
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const navigation = useNavigation();
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(`${API_URL}/sentiment/get_sentiments`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data) {
          setScores(data.data);
        } else {
          throw new Error('Invalid data structure');
        }

      } catch (err) {
        console.error('Error fetching mental scores:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown:false
      });
    }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text style={{ 
        marginTop: 10, 
        fontSize: 36,
        color: '#4F46E5',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 21,

      }}>Analyzing...</Text>

    </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }
   const analyzeNow = async () => {
    setLoading(true);
      try {
        const response = await fetch(`${API_URL}/sentiment/analyze`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        const result = await response.json();
    
        if (response.ok) {
          console.log('Analysis status:', result);
        
          
        } else {
          console.error('Failed to Analyze:', result.message);
        }
      } catch (error) {
        console.error('Network error while Analyzing:', error.message);
      } finally{
        setLoading(false);
      }
    };




  const labels = scores.map(item => item.date.slice(5)); // MM-DD format
  const mentalScores = scores.map(item => item.mental_score);
  const latestEntry = scores[scores.length - 1];
  const router = useRouter();
  const cards = [
    { title: 'Suggestions', content: latestEntry.suggestions.join('\n\n') },
    { title: 'Reflection', content: latestEntry.reflection_text },
    { title: 'Supporting Text', content: latestEntry.supporting_text.join('\n\n') },
  ];

  return (
    <View>


      <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              {/* <Text style={styles.backButton}>{"<"}</Text> */}
              <AntDesign name="arrowleft" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mental analysis</Text>
            <View/> 
          </View>
       <ScrollView contentContainerStyle={styles.container}>
  
      <Text style={styles.title}>Mental Score Trend</Text>
      <Text style={styles.subtitle}>Track your emotional well-being over time.</Text>

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels,
            datasets: [{ data: mentalScores }],
          }}
          
          width={Dimensions.get('window').width - 30}
          height={280}
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#4F46E5',
            backgroundGradientFrom: '#6366F1',
            backgroundGradientTo: '#818CF8',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#6366F1',
            },
          }}
          bezier
          style={{ borderRadius: 16}}
        />
      </View>


      <TouchableOpacity onPress={analyzeNow} style={{ backgroundColor: '#4F46E5', padding: 15, borderRadius: 10, margin: 20 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>Analyze Now</Text>
      </TouchableOpacity>
        

<View style={styles.swiperContainer}>
  <Swiper
    cards={cards}
    renderCard={(card) => (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardContent}>{card.content}</Text>
      </View>
    )}
    infinite
    verticalSwipe={true}
    horizontalSwipe={true}
    stackSize={2}
    backgroundColor="transparent"
    stackSeparation={5}
  />
</View>
<Text style={styles.swipeHint}>Swipe up to see more</Text>

    </ScrollView>
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4B5563',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
header: {
    height: 60,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: { color: '#fff', fontSize: 24 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' ,paddingLeft: 10},
  swiperContainer: {
    flex: 1,
    minHeight: 300, // Ensure it doesn't overlap chart
    marginBottom: 80,
    marginLeft: -20,
    marginTop:-30
  },
swipeHint: {
    textAlign: 'center',
    color: '#6B7280',
    margin: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    height: 310,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'left',
  },
  loaderContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
  zIndex: 10, 

}
});