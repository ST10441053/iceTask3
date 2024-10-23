import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons'; // For the star button

const Stack = createNativeStackNavigator();

// Recyclable items and contaminants
const recyclableItems = [
  { id: 1, name: 'Plastic Bottle' },
  { id: 2, name: 'Aluminum Can' },
  { id: 3, name: 'Glass Jar' },
  { id: 4, name: 'Paper' },
  { id: 5, name: 'Cardboard Box' },
  { id: 6, name: 'Plastic Bag' },
];

const contaminants = [
  { id: 7, name: 'Food Waste' },
  { id: 8, name: 'Broken Glass' },
  { id: 9, name: 'Diaper' },
  { id: 10, name: 'Styrofoam' },
];

// Generate pairs of recyclable items and random contaminants, then shuffle
const generateCards = () => {
  const items = [...recyclableItems, ...recyclableItems]; // Duplicate recyclable items for matching
  const mixedItems = [...items, ...contaminants]; // Add contaminants into the game

  return mixedItems
    .sort(() => Math.random() - 0.5)
    .map((item, index) => ({
      ...item,
      isFlipped: false,
      isMatched: false,
      key: index.toString(),
    }));
};

// Home Screen Component
const HomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.homeContainer}>
      <Text style={styles.homeTitle}>Recycling Challenge</Text>
      <Text style={styles.homeDescription}>
        Test your recycling knowledge! Match the recyclable items and avoid the contaminants before the garbage truck arrives.
      </Text>
      
      <TouchableOpacity style={styles.starButton} onPress={() => navigation.navigate('Game')}>
        <FontAwesome name="star" size={50} color="yellow" />
      </TouchableOpacity>

      <Text style={styles.homeText}>Tap the star to start the game</Text>
    </View>
  );
};

const GameScreen = ({ navigation }: { navigation: any }) => {
  const [cards, setCards] = useState(generateCards());
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40); // Garbage truck timer set to 40 seconds

  // Timer effect for garbage truck countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      Alert.alert('Time is up!', 'The garbage truck has arrived!');
      navigation.navigate('Result', { score });
    }
  }, [timeLeft, navigation]);

  const flipCard = (index: number) => {
    if (selectedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    setSelectedCards([...selectedCards, newCards[index]]);
  };

  // Handle card matching logic
  useEffect(() => {
    if (selectedCards.length === 2) {
      setTimeout(() => {
        const [firstCard, secondCard] = selectedCards;
        let newCards = [...cards];

        if (firstCard.name === secondCard.name && !contaminants.find(c => c.name === firstCard.name)) {
          // It's a match and both cards are recyclable
          newCards = newCards.map(card =>
            card.name === firstCard.name ? { ...card, isMatched: true } : card
          );
          setScore(score + 1); // Earn a recycling point
        } else if (contaminants.find(c => c.name === firstCard.name || c.name === secondCard.name)) {
          // Selected a contaminant, deduct points
          newCards = newCards.map(card =>
            card.key === firstCard.key || card.key === secondCard.key
              ? { ...card, isFlipped: false }
              : card
          );
          setScore(Math.max(0, score - 1)); // Contaminants deduct points
        } else {
          // Not a match, flip both cards back
          newCards = newCards.map(card =>
            card.key === firstCard.key || card.key === secondCard.key
              ? { ...card, isFlipped: false }
              : card
          );
        }

        setCards(newCards);
        setSelectedCards([]);
      }, 1000);
    }
  }, [selectedCards, cards, score]);

  // Check if all recyclable items are matched
  useEffect(() => {
    if (cards.every(card => card.isMatched)) {
      Alert.alert('Well done!', 'You have cleared the bin!');
      navigation.navigate('Result', { score });
    }
  }, [cards, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recycling Memory Game</Text>
      <Text style={styles.score}>Recycling Points: {score}</Text>
      <Text style={styles.timer}>Garbage Truck Arrives In: {timeLeft}s</Text>

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.key}
            style={[styles.card, card.isFlipped || card.isMatched ? styles.flippedCard : {}]}
            onPress={() => flipCard(index)}
          >
            <Text style={styles.cardText}>
              {card.isFlipped || card.isMatched ? card.name : '❓'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const ResultScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { score } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Over</Text>
      <Text style={styles.score}>You earned {score} recycling points!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf0d5',
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#023047',
    padding: 20,
  },
  homeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  homeDescription: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  homeText: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 20,
  },
  starButton: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  score: {
    fontSize: 20,
    marginBottom: 10,
  },
  timer: {
    fontSize: 18,
    marginBottom: 20,
    color: '#D32F2F',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 100,
    height: 100,
    backgroundColor: '#003049',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  flippedCard: {
    backgroundColor: '#90e0ef',
  },
  cardText: {
    fontSize: 18,
    color: '#000',
  },
 
button: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
  },
});

export default App;