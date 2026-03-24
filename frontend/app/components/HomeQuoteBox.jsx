import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

const QUOTES = [
  {
    text: "Binge eating does not mean that something is wrong with you; it's a natural but primitive brain response that you can correct.",
    author: "Katherine Hansen",
  },
  {
    text: "The binge urges—this desire to binge—is the one and only direct cause of binge eating.",
    author: "Katherine Hansen",
  },
  {
    text: "Without the urges to binge, you simply would not binge, regardless of the problems in your life.",
    author: "Katherine Hansen",
  },
  {
    text: "You binge not to cope with these emotions and with these problems, but in order to cope with the urges to binge.",
    author: "Katherine Hansen",
  },
  {
    text: "You are healthy... there isn't anything fundamentally wrong with you. You're just a temporary victim of your own healthy brain.",
    author: "Katherine Hansen",
  },
  {
    text: "The most important thing is to separate improving yourself and improving your life from stopping binge eating.",
    author: "Cookie Rosenbloom",
  },
  {
    text: "The survival state is actually a symptom of a healthy brain, not a sign of disease; it's simply your brain trying to protect you.",
    author: "Katherine Hansen",
  },
  {
    text: "Your higher brain is what we associate with our identity and with our goals... it's our more rational self.",
    author: "Katherine Hansen",
  },
  {
    text: "The lower brain cannot move voluntary muscles by itself; it needs the higher brain to act or to go along with it.",
    author: "Katherine Hansen",
  },
  {
    text: "It's not a true loss of control; it's a perceived feeling of losing control. You still do retain the capacity to choose.",
    author: "Katherine Hansen",
  },
  {
    text: "The feeling of wanting could almost be described as an illusion... this is what I call false wanting.",
    author: "Katherine Hansen",
  },
  {
    text: "View the urges to binge as neurological junk... it's just some neurons firing in a way that they shouldn't be.",
    author: "Katherine Hansen",
  },
  {
    text: "The binge urges don't signal a real need or something that you truly want.",
    author: "Katherine Hansen",
  },
  {
    text: "We want you to try to view that urge as non-threatening and experience it without a lot of fear.",
    author: "Katherine Hansen",
  },
  {
    text: "You, in your higher brain, have complete power over your binge urges.",
    author: "Katherine Hansen",
  },
  {
    text: "The goal is to make the urges comfortable enough that you can dismiss them.",
    author: "Cookie Rosenbloom",
  },
  {
    text: "A binge doesn't mean you're back to square one; you can learn from it and you can move forward.",
    author: "Katherine Hansen",
  },
  {
    text: "Leaving the binge eating behind you will open you up to all kinds of possibilities.",
    author: "Cookie Rosenbloom",
  },
  {
    text: "If anyone can do this, you can too... you have the power to rewire your brain and live a binge-free life.",
    author: "Cookie Rosenbloom",
  },
  {
    text: "The feeling of wanting to do it feels real, but it's based on a false thought.",
    author: "Cookie Rosenbloom",
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
        <Ionicons name="sparkles" size={16} color="#7e1f8c" />
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
    color: '#7e1f8c',
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
