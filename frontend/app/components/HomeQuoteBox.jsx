import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

const QUOTES = [
  {
    text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.",
    author: "Anonymous",
  },
  {
    text: "Every moment is a fresh beginning.",
    author: "T.S. Eliot",
  },
  {
    text: "You are stronger than your urges. One day at a time.",
    author: "BingeBuddy",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Healing is not linear — every step forward counts.",
    author: "Anonymous",
  },
  {
    text: "You didn't come this far to only come this far.",
    author: "Anonymous",
  },
  {
    text: "Progress, not perfection.",
    author: "Anonymous",
  },
];

const HomeQuoteBox = () => {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[idx]);
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.iconRow}>
        <Ionicons name="sparkles" size={16} color="#7B1FA2" />
        <Text style={styles.label}>Daily Inspiration</Text>
      </View>
      <Text style={styles.quoteText}>"{quote.text}"</Text>
      <Text style={styles.author}>— {quote.author}</Text>
    </View>
  );
};

export default HomeQuoteBox;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7B1FA2',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quoteText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 23,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  author: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    textAlign: 'right',
  },
});
