'use client';

export const speakText = (text, onEnd = () => {}, rate = 1.0) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  
  // Find US English female voice, updated with more options for 2025
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(voice => 
    voice.lang.includes('en-US') && 
    (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('aria') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('neural'))
  );
  
  if (femaleVoice) utterance.voice = femaleVoice;

  utterance.onend = () => {
    console.log('Speech ended');
    onEnd();
  };

  utterance.onerror = (event) => {
    console.error('Speech error:', event);
    onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
};