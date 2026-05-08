'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Mic, Command, Brain, AlertTriangle, MapPin, Cloud, Calendar } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import axios from 'axios';

// Custom Button component
const Button = ({ children, className, ...props }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-28 w-28 md:h-32 md:w-32 lg:h-40 lg:w-40 bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-xl transform hover:scale-105 duration-300 ease-in-out group ${className}`}
    {...props}
  >
    {children}
  </button>
);

// List of countries and Nigerian states
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Australia', 'Austria', 'Bangladesh',
  'Belgium', 'Brazil', 'Canada', 'China', 'Colombia', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany',
  'Ghana', 'Greece', 'Hong Kong', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya',
  'Malaysia', 'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain',
  'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam'
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", 
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", 
  "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", 
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", 
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const AIAssistantPage = () => {
  const { currentUser } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  const [lang, setLang] = useState('en-US');
  
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const recognitionRef = useRef(null);
  const noiseModelRef = useRef(null);
  const recognitionStreamRef = useRef(null);
  const reminderTimeouts = useRef({});

  // Chappie's persona information
  const chappieInfo = {
    name: "Chappie",
    creator: "Stephen Okwu Chidi",
    capabilities: "I can help you manage contacts, appointments, reminders, answer questions, provide weather forecasts, give directions, tell the current time in any country, and much more!",
    creatorDescription: "Stephen Okwu Chidi is my brilliant creator - a visionary developer who designed me to be your intelligent personal assistant. He's passionate about creating AI that truly helps people.",
    greetings: [
      "Hello there! I'm Chappie, your AI personal assistant. How can I help you today?",
      "Hey! Chappie here, ready to assist. What's on your mind?",
      "Greetings! I'm Chappie. How may I be of service?",
      "Good to hear from you! Chappie at your command."
    ],
    generalKnowledgeIntro: "Accessing my knowledge networks for that information..."
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      // Clear all pending reminders
      Object.values(reminderTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      // Clean up audio resources
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (recognitionStreamRef.current) {
        recognitionStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
 
  useEffect(() => {
    const loadNoiseModel = async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        const speechCommands = await import('@tensorflow-models/speech-commands');
        
        await tf.ready();
        const recognizer = speechCommands.create('BROWSER_FFT');
        await recognizer.ensureModelLoaded();
        noiseModelRef.current = recognizer;
        console.log('Noise cancellation model loaded');
      } catch (error) {
        console.error('Failed to load noise model:', error);
      }
    };

    loadNoiseModel();
    // Dynamically import TensorFlow with SSR disabled
    const loadTensorFlow = async () => {
    const tf = await import('@tensorflow/tfjs');
    const speechCommands = await import('@tensorflow-models/speech-commands');
    return { tf, speechCommands };
   };
  }, []);

  // Speak text with female voice similar to Alexa/Google
  const speakText = (text, callback = () => {}) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Speech synthesis not supported');
      callback();
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    
    // Find voice similar to Alexa/Google (female, natural sounding)
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = voices.find(voice => 
      (voice.name.includes('Google') || voice.name.includes('Alexa') || voice.name.includes('Samantha') || voice.name.includes('Female')) &&
      voice.lang.includes('en-US')
    );
    
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => voice.lang.includes('en-US'));
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      callback();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      callback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Sets up the audio visualizer on the canvas
  const setupAudioVisualizer = async (stream) => {
    if (!canvasRef.current) return;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;

    if (audioContext.state === 'running') {
      await audioContext.suspend();
    }

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const draw = () => {
      animationFrameIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        canvasCtx.fillStyle = `rgb(255, ${200 - barHeight}, 75)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    
    await audioContext.resume();
    draw();
  };

  // Stops the audio visualizer
  const stopAudioVisualizer = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Handles the voice command initiation and recognition
  const handleVoiceCommand = async () => {
    // If already listening, stop recognition
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg = 'Speech recognition is not supported in your browser';
      setMessage(msg);
      toast.error(msg);
      speakText(msg);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionStreamRef.current = stream;
      setupAudioVisualizer(stream);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsListening(true);
        setMessage('Listening... Speak clearly');
      };

      recognition.onresult = async (event) => {
        let finalCommand = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalCommand += event.results[i][0].transcript;
          }
        }
        
        if (finalCommand) {
          // Check if this is likely voice using noise model
          if (noiseModelRef.current) {
            try {
              const audioSamples = await getAudioData(stream);
              if (audioSamples && audioSamples.length > 0) {
                // Check if audio has significant energy (not silence/noise)
                const maxAbs = Math.max(...audioSamples.map(Math.abs));
                if (maxAbs < 0.01) { // Threshold for silence
                  console.log('Ignoring silent audio');
                  return;
                }
                const prediction = await noiseModelRef.current.recognize(audioSamples);
                const noiseProbability = prediction.scores[0]; // Assuming index 0 is background_noise
                
                if (noiseProbability > 0.75) {
                  console.log('Ignoring noise:', finalCommand, 'Noise probability:', noiseProbability);
                  return;
                }
              } else {
                console.log('No valid audio samples, skipping noise check');
              }
            } catch (error) {
              console.warn('Noise model prediction failed, proceeding anyway:', error.message);
            }
          }
          
          recognition.stop();
          setTranscript(finalCommand);
          handleCommand(finalCommand);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setMessage('Ready for next command');
        stopAudioVisualizer();
        if (recognitionStreamRef.current) {
          recognitionStreamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        stopAudioVisualizer();
        if (recognitionStreamRef.current) {
          recognitionStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (event.error !== 'no-speech') {
          console.error('Recognition error:', event.error);
        }
        if (event.error === 'no-speech') {
          // Silently handle no-speech by stopping and readying for next
          setMessage('Ready for next command');
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);

      recognition.start();
    } catch (err) {
      console.error('Microphone error:', err);
      speakText('Microphone access denied. Please allow access to use voice commands.');
    }
  };

  // Get audio data for noise model (collect more samples for better detection)
  const getAudioData = async (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1); // Larger buffer for better analysis
      
      let collectedSamples = [];
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          if (collectedSamples.length > 0) {
            resolve(new Float32Array(collectedSamples));
          } else {
            reject(new Error('No audio data collected'));
          }
        }, 1500); // Collect for 1.5 seconds
        
        const cleanup = () => {
          clearTimeout(timeout);
          processor.disconnect();
          source.disconnect();
          if (audioContext.state !== 'closed') {
            audioContext.close().catch(console.error);
          }
        };
        
        processor.onaudioprocess = (event) => {
          const channelData = event.inputBuffer.getChannelData(0);
          collectedSamples = [...collectedSamples, ...Array.from(channelData)];
        };
      });
    } catch (error) {
      console.warn('Error in getAudioData:', error.message);
      throw error;
    }
  };

  // Set reminder with exact timing
  const setExactReminder = (reminderText, triggerTime) => {
    const now = new Date().getTime();
    const timeout = triggerTime - now;
    
    if (timeout <= 0) {
      speakText("I can't set reminders for past times");
      return null;
    }
    
    const timeoutId = setTimeout(() => {
      speakText(`Reminder: ${reminderText}`);
      delete reminderTimeouts.current[timeoutId];
    }, timeout);
    
    reminderTimeouts.current[timeoutId] = timeoutId;
    return timeoutId;
  };

  // Parses date from a given command string
  const parseDateFromCommand = (lowerCommand, now) => {
    let date = '';
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(now.getDate() + 2);
    const dayAfterTomorrowDate = dayAfterTomorrow.toISOString().split('T')[0];

    if (lowerCommand.includes('today')) {
      date = today;
    } else if (lowerCommand.includes('tomorrow')) {
      date = tomorrowDate;
    } else if (lowerCommand.includes('day after tomorrow') || lowerCommand.includes('next tomorrow')) {
      date = dayAfterTomorrowDate;
    } else if (lowerCommand.includes('next week')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      date = nextWeek.toISOString().split('T')[0];
    } else if (lowerCommand.includes('next month')) {
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      date = nextMonth.toISOString().split('T')[0];
    } else if (lowerCommand.includes('next year')) {
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);
      date = nextYear.toISOString().split('T')[0];
    } else {
      const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      // Regex to capture month, day, and optional year
      const datePattern = new RegExp(`(?:on|for|at)\\s+(${monthNames.join('|')})\\s+(\\d{1,2})(?:(?:st|nd|rd|th),?\\s*|\\s+)(\\d{4})?`, 'i');
      const specificDateMatch = lowerCommand.match(datePattern);

      if (specificDateMatch) {
        const monthIndex = monthNames.indexOf(specificDateMatch[1].toLowerCase());
        const day = parseInt(specificDateMatch[2]);
        // If year is not provided, use current year
        const year = specificDateMatch[3] ? parseInt(specificDateMatch[3]) : now.getFullYear();
        const parsedDate = new Date(year, monthIndex, day);
        date = parsedDate.toISOString().split('T')[0];
      } else {
        date = today; // Default to today if no date specified
      }
    }
    return date;
  };

  // Parses time (start and end) from a given command string
  const parseTimeFromCommand = (lowerCommand, now) => {
    let startTime = '';
    let endTime = '';

    // Regex to capture time in various formats (e.g., 3 PM, 3pm, 3:00 PM, 15:00)
    const timePattern = /(\d{1,2}(?::\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)?)/gi;
    const times = [];
    let match;
    while ((match = timePattern.exec(lowerCommand)) !== null) {
      if (match[1].trim() && (/\d/.test(match[1]) || /(am|pm)/i.test(match[1]))) {
        times.push(match[1].replace(/\./g, '')); // Remove dots from a.m./p.m.
      }
    }

    // Converts 12-hour time to 24-hour format
    const convertTo24Hour = (timeStr) => {
      let [h, m = '00'] = timeStr.replace(/(am|pm)/i, '').split(':');
      h = parseInt(h);
      const isPM = timeStr.toLowerCase().includes('p');
      const isAM = timeStr.toLowerCase().includes('a');

      if (isPM && h < 12) h += 12; // Add 12 for PM times, unless it's 12 PM
      if (isAM && h === 12) h = 0; // Convert 12 AM to 00 (midnight)
      return `${String(h).padStart(2, '0')}:${m.padStart(2, '0')}`;
    };

    if (times.length > 0) {
      startTime = convertTo24Hour(times[0]);
      if (times.length > 1) {
        endTime = convertTo24Hour(times[1]);
      }
    } else {
      // Default to current time if no time specified
      startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    return { startTime, endTime };
  };

  // Function to get current time in a specific time zone
  const getCurrentTimeInZone = (zone) => {
    try {
      const options = {
        timeZone: zone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short',
      };
      return new Intl.DateTimeFormat('en-US', options).format(new Date());
    } catch (error) {
      return "Sorry, I couldn't find the time zone for that location.";
    }
  };

  // Main command handler
  const handleCommand = async (command) => {
    const lowerCommand = command.toLowerCase();
    const now = new Date();
    setMessage(`Processing: "${command}"`);

    // --- Time Query Handling ---
    if (lowerCommand.includes('what time is it') || lowerCommand.includes('time in')) {
      let zone = 'Africa/Lagos'; // Default to Nigeria UTC+1
      if (lowerCommand.includes('time in')) {
        const locationMatch = lowerCommand.match(/time in (.+)/i);
        if (locationMatch) {
          const location = locationMatch[1].trim();
          // Simple mapping for common locations; expand as needed or use API
          const zoneMap = {
            'afghanistan': 'Asia/Kabul',
            'albania': 'Europe/Tirane',
            'algeria': 'Africa/Algiers',
            'andorra': 'Europe/Andorra',
            'angola': 'Africa/Luanda',
            'antigua and barbuda': 'America/Antigua',
            'argentina': 'America/Argentina/Buenos_Aires',
            'armenia': 'Asia/Yerevan',
            'australia': 'Australia/Sydney',
            'austria': 'Europe/Vienna',
            'azerbaijan': 'Asia/Baku',
            'bahamas': 'America/Nassau',
            'bahrain': 'Asia/Bahrain',
            'bangladesh': 'Asia/Dhaka',
            'barbados': 'America/Barbados',
            'belarus': 'Europe/Minsk',
            'belgium': 'Europe/Brussels',
            'belize': 'America/Belize',
            'benin': 'Africa/Porto-Novo',
            'bhutan': 'Asia/Thimphu',
            'bolivia': 'America/La_Paz',
            'bosnia and herzegovina': 'Europe/Sarajevo',
            'botswana': 'Africa/Gaborone',
            'brazil': 'America/Sao_Paulo',
            'brunei': 'Asia/Brunei',
            'bulgaria': 'Europe/Sofia',
            'burkina faso': 'Africa/Ouagadougou',
            'burundi': 'Africa/Bujumbura',
            'cabo verde': 'Atlantic/Cape_Verde',
            'cambodia': 'Asia/Phnom_Penh',
            'cameroon': 'Africa/Douala',
            'canada': 'America/Toronto',
            'central african republic': 'Africa/Bangui',
            'chad': 'Africa/Ndjamena',
            'chile': 'America/Santiago',
            'china': 'Asia/Shanghai',
            'colombia': 'America/Bogota',
            'comoros': 'Indian/Comoro',
            'congo': 'Africa/Brazzaville',
            'costa rica': 'America/Costa_Rica',
            'croatia': 'Europe/Zagreb',
            'cuba': 'America/Havana',
            'cyprus': 'Asia/Nicosia',
            'czech republic': 'Europe/Prague',
            'democratic republic of the congo': 'Africa/Kinshasa',
            'denmark': 'Europe/Copenhagen',
            'djibouti': 'Africa/Djibouti',
            'dominica': 'America/Dominica',
            'dominican republic': 'America/Santo_Domingo',
            'ecuador': 'America/Guayaquil',
            'egypt': 'Africa/Cairo',
            'el salvador': 'America/El_Salvador',
            'equatorial guinea': 'Africa/Malabo',
            'eritrea': 'Africa/Asmara',
            'estonia': 'Europe/Tallinn',
            'eswatini': 'Africa/Mbabane',
            'ethiopia': 'Africa/Addis_Ababa',
            'fiji': 'Pacific/Fiji',
            'finland': 'Europe/Helsinki',
            'france': 'Europe/Paris',
            'gabon': 'Africa/Libreville',
            'gambia': 'Africa/Banjul',
            'georgia': 'Asia/Tbilisi',
            'germany': 'Europe/Berlin',
            'ghana': 'Africa/Accra',
            'greece': 'Europe/Athens',
            'grenada': 'America/Grenada',
            'guatemala': 'America/Guatemala',
            'guinea': 'Africa/Conakry',
            'guinea-bissau': 'Africa/Bissau',
            'guyana': 'America/Guyana',
            'haiti': 'America/Port-au-Prince',
            'honduras': 'America/Tegucigalpa',
            'hungary': 'Europe/Budapest',
            'iceland': 'Atlantic/Reykjavik',
            'india': 'Asia/Kolkata',
            'indonesia': 'Asia/Jakarta',
            'iran': 'Asia/Tehran',
            'iraq': 'Asia/Baghdad',
            'ireland': 'Europe/Dublin',
            'israel': 'Asia/Jerusalem',
            'italy': 'Europe/Rome',
            'jamaica': 'America/Jamaica',
            'japan': 'Asia/Tokyo',
            'jordan': 'Asia/Amman',
            'kazakhstan': 'Asia/Almaty',
            'kenya': 'Africa/Nairobi',
            'kiribati': 'Pacific/Tarawa',
            'kuwait': 'Asia/Kuwait',
            'kyrgyzstan': 'Asia/Bishkek',
            'laos': 'Asia/Vientiane',
            'latvia': 'Europe/Riga',
            'lebanon': 'Asia/Beirut',
            'lesotho': 'Africa/Maseru',
            'liberia': 'Africa/Monrovia',
            'libya': 'Africa/Tripoli',
            'liechtenstein': 'Europe/Vaduz',
            'lithuania': 'Europe/Vilnius',
            'luxembourg': 'Europe/Luxembourg',
            'madagascar': 'Indian/Antananarivo',
            'malawi': 'Africa/Blantyre',
            'malaysia': 'Asia/Kuala_Lumpur',
            'maldives': 'Indian/Maldives',
            'mali': 'Africa/Bamako',
            'malta': 'Europe/Malta',
            'marshall islands': 'Pacific/Majuro',
            'mauritania': 'Africa/Nouakchott',
            'mauritius': 'Indian/Mauritius',
            'mexico': 'America/Mexico_City',
            'micronesia': 'Pacific/Chuuk',
            'moldova': 'Europe/Chisinau',
            'monaco': 'Europe/Monaco',
            'mongolia': 'Asia/Ulaanbaatar',
            'montenegro': 'Europe/Podgorica',
            'morocco': 'Africa/Casablanca',
            'mozambique': 'Africa/Maputo',
            'myanmar': 'Asia/Yangon',
            'namibia': 'Africa/Windhoek',
            'nauru': 'Pacific/Nauru',
            'nepal': 'Asia/Kathmandu',
            'netherlands': 'Europe/Amsterdam',
            'new zealand': 'Pacific/Auckland',
            'nicaragua': 'America/Managua',
            'niger': 'Africa/Niamey',
            'nigeria': 'Africa/Lagos',
            'north korea': 'Asia/Pyongyang',
            'north macedonia': 'Europe/Skopje',
            'norway': 'Europe/Oslo',
            'oman': 'Asia/Muscat',
            'pakistan': 'Asia/Karachi',
            'palau': 'Pacific/Palau',
            'palestine': 'Asia/Gaza',
            'panama': 'America/Panama',
            'papua new guinea': 'Pacific/Port_Moresby',
            'paraguay': 'America/Asuncion',
            'peru': 'America/Lima',
            'philippines': 'Asia/Manila',
            'poland': 'Europe/Warsaw',
            'portugal': 'Europe/Lisbon',
            'qatar': 'Asia/Qatar',
            'romania': 'Europe/Bucharest',
            'russia': 'Europe/Moscow',
            'rwanda': 'Africa/Kigali',
            'saint kitts and nevis': 'America/St_Kitts',
            'saint lucia': 'America/St_Lucia',
            'saint vincent and the grenadines': 'America/St_Vincent',
            'samoa': 'Pacific/Apia',
            'san marino': 'Europe/San_Marino',
            'sao tome and principe': 'Africa/Sao_Tome',
            'saudi arabia': 'Asia/Riyadh',
            'senegal': 'Africa/Dakar',
            'serbia': 'Europe/Belgrade',
            'seychelles': 'Indian/Mahe',
            'sierra leone': 'Africa/Freetown',
            'singapore': 'Asia/Singapore',
            'slovakia': 'Europe/Bratislava',
            'slovenia': 'Europe/Ljubljana',
            'solomon islands': 'Pacific/Guadalcanal',
            'somalia': 'Africa/Mogadishu',
            'south africa': 'Africa/Johannesburg',
            'south korea': 'Asia/Seoul',
            'south sudan': 'Africa/Juba',
            'spain': 'Europe/Madrid',
            'sri lanka': 'Asia/Colombo',
            'sudan': 'Africa/Khartoum',
            'suriname': 'America/Paramaribo',
            'sweden': 'Europe/Stockholm',
            'switzerland': 'Europe/Zurich',
            'syria': 'Asia/Damascus',
            'taiwan': 'Asia/Taipei',
            'tajikistan': 'Asia/Dushanbe',
            'tanzania': 'Africa/Dar_es_Salaam',
            'thailand': 'Asia/Bangkok',
            'timor-leste': 'Asia/Dili',
            'togo': 'Africa/Lome',
            'tonga': 'Pacific/Tongatapu',
            'trinidad and tobago': 'America/Port_of_Spain',
            'tunisia': 'Africa/Tunis',
            'turkey': 'Europe/Istanbul',
            'turkmenistan': 'Asia/Ashgabat',
            'tuvalu': 'Pacific/Funafuti',
            'uganda': 'Africa/Kampala',
            'ukraine': 'Europe/Kiev',
            'united arab emirates': 'Asia/Dubai',
            'united kingdom': 'Europe/London',
            'uk': 'Europe/London',
            'united states': 'America/New_York',
            'usa': 'America/New_York',
            'us': 'America/New_York',
            'uruguay': 'America/Montevideo',
            'uzbekistan': 'Asia/Tashkent',
            'vanuatu': 'Pacific/Efate',
            'vatican city': 'Europe/Vatican',
            'venezuela': 'America/Caracas',
            'vietnam': 'Asia/Ho_Chi_Minh',
            'yemen': 'Asia/Aden',
            'zambia': 'Africa/Lusaka',
            'zimbabwe': 'Africa/Harare'
          };
          zone = zoneMap[location.toLowerCase()] || zone;
        }
      }
      const timeResponse = `The current time in ${zone} is ${getCurrentTimeInZone(zone)}.`;
      toast.info(timeResponse);
      speakText(timeResponse, handleVoiceCommand);
      return;
    }

    // --- Personal Information Responses ---
    if (lowerCommand.includes('who are you') || lowerCommand.includes('what is your name') || lowerCommand.includes('who is chappie')) {
      const response = `I am ${chappieInfo.name}, your personal assistant. It's a pleasure to meet you!`;
      toast.info(response);
      speakText(response, handleVoiceCommand);
      return;
    }
    if (lowerCommand.includes('who created you') || lowerCommand.includes('who is your creator') || lowerCommand.includes('who is your maker')) {
      const response = chappieInfo.creatorDescription;
      toast.info(response);
      speakText(response, handleVoiceCommand);
      return;
    }
    if (lowerCommand.includes('what can you do') || lowerCommand.includes('your capabilities')) {
      const response = chappieInfo.capabilities;
      toast.info(response);
      speakText(response, handleVoiceCommand);
      return;
    }
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('how are you')) {
      const greeting = chappieInfo.greetings[Math.floor(Math.random() * chappieInfo.greetings.length)];
      toast.info(greeting);
      speakText(greeting, handleVoiceCommand);
      return;
    }
    if (lowerCommand.includes('switch to us english')) {
      setLang('en-US');
      const response = "Alright, I've switched to American English for you! What would you like to talk about?";
      toast.info(response);
      speakText(response, handleVoiceCommand);
      return;
    }
    if (lowerCommand.includes('switch to uk english')) {
      setLang('en-GB');
      const response = "Righto, I've switched to British English for you! What would you like to chat about?";
      toast.info(response);
      speakText(response, handleVoiceCommand);
      return;
    }

    // --- Appointment Handling ---
    const appointmentKeywords = ['set', 'add', 'book', 'schedule', 'create'];
    const isAppointmentCommand = appointmentKeywords.some(keyword => lowerCommand.includes(keyword)) &&
                                 (lowerCommand.includes('appointment') || lowerCommand.includes('meeting'));

    if (isAppointmentCommand) {
      const date = parseDateFromCommand(lowerCommand, now);
      const { startTime, endTime } = parseTimeFromCommand(lowerCommand, now);

      let location = 'Unspecified Location';
      // More robust location extraction
      const locationMatch = lowerCommand.match(/(?:in|at|for|to)\s+([a-zA-Z\s]+?)(?:(?=\s*(?:on|from|to|\d|by|$))|\s*$)/i);
      if (locationMatch && locationMatch[1].trim() !== '') {
        const matchedCountry = countries.find(c => lowerCommand.includes(c.toLowerCase()));
        location = matchedCountry || locationMatch[1].trim();
      }

      let appointmentDateTime;
      try {
        appointmentDateTime = new Date(`${date}T${startTime}`);
        if (isNaN(appointmentDateTime.getTime())) {
          throw new Error('Invalid date/time');
        }
      } catch (error) {
        const invalidMessage = "Invalid date or time format. Please specify clearly, e.g., 'tomorrow at 2 PM'.";
        toast.error(invalidMessage);
        speakText(invalidMessage, handleVoiceCommand);
        return;
      }

      let appointmentEndDateTime = null;
      if (endTime) {
        try {
          appointmentEndDateTime = new Date(`${date}T${endTime}`);
          if (isNaN(appointmentEndDateTime.getTime())) {
            throw new Error('Invalid end time');
          }
        } catch (error) {
          const invalidMessage = "Invalid end time format.";
          toast.error(invalidMessage);
          speakText(invalidMessage, handleVoiceCommand);
          return;
        }
      }

      // Validate date and time
      if (appointmentDateTime.toISOString().split('T')[0] < now.toISOString().split('T')[0]) {
        const pastDateMessage = "I cannot book an appointment for a past date. Please provide a future date.";
        toast.error(pastDateMessage);
        speakText(pastDateMessage, handleVoiceCommand);
        return;
      }

      if (appointmentDateTime.toISOString().split('T')[0] === now.toISOString().split('T')[0] && appointmentDateTime < now) {
          const pastTimeMessage = "I cannot book an appointment for a past time today. Please provide a future time.";
          toast.error(pastTimeMessage);
          speakText(pastTimeMessage, handleVoiceCommand);
          return;
      }

      if (endTime && appointmentEndDateTime <= appointmentDateTime) {
        const invalidTimeRangeMessage = "The end time must be after the start time for your appointment.";
        toast.error(invalidTimeRangeMessage);
        speakText(invalidTimeRangeMessage, handleVoiceCommand);
        return;
      }

      // Prepare appointment data
      const newAppointment = {
        userId: currentUser?.uid || 'anonymous',
        date,
        startTime,
        endTime,
        location
      };

      try {
        // Send appointment data to backend
        const response = await axios.post('http://localhost:5000/api/appointments', newAppointment);
        if (response.status === 200 || response.status === 201) {
          const successMessage = `Appointment for "${newAppointment.location}" on ${newAppointment.date} from ${newAppointment.startTime}${newAppointment.endTime ? ` to ${newAppointment.endTime}` : ''} added successfully!`;
          toast.success(successMessage);
          speakText(successMessage, handleVoiceCommand);
        } else {
          const errorMessage = 'I encountered an issue saving the appointment. Please try again later.';
          toast.error(errorMessage);
          speakText(errorMessage, handleVoiceCommand);
        }
      } catch (error) {
        console.error('API call failed:', error);
        const networkErrorMessage = 'I could not connect to the backend to save the appointment. Please check your network connection.';
        toast.error(networkErrorMessage);
        speakText(networkErrorMessage, handleVoiceCommand);
      }
    }
    // --- Reminder Handling ---
    else if (lowerCommand.includes('set a reminder to') || lowerCommand.includes('add a reminder to') || lowerCommand.includes('remind me to')) {
      const reminderMatch = lowerCommand.match(/(?:remind me to|set a reminder to|add a reminder to) (.+?)(?: at| on| for|$)/i);
      if (reminderMatch && reminderMatch[1]) {
        const reminderText = reminderMatch[1].trim();
        let triggerTime = new Date();
        
        // Parse specific time
        const timePattern = /at (\d{1,2}(?::\d{2})?\s?(?:am|pm)?)/i;
        const timeMatch = lowerCommand.match(timePattern);
        
        if (timeMatch) {
          const timeStr = timeMatch[1];
          const [hourStr, minuteStr] = timeStr.includes(':') ? 
            timeStr.split(':') : 
            [timeStr.replace(/\D/g, ''), '00'];
          
          let hours = parseInt(hourStr);
          const minutes = parseInt(minuteStr.replace(/\D/g, '') || 0);
          const isPM = timeStr.toLowerCase().includes('pm') && hours < 12;
          
          if (isPM) hours += 12;
          triggerTime.setHours(hours, minutes, 0, 0);
          
          // If time is in the past, set for next day
          if (triggerTime < now) {
            triggerTime.setDate(triggerTime.getDate() + 1);
          }
        } 
        // Parse relative time
        else if (lowerCommand.includes('in')) {
          const timeMatch = lowerCommand.match(/in (\d+)\s*(minute|hour|day|week)s?/i);
          if (timeMatch) {
            const amount = parseInt(timeMatch[1]);
            const unit = timeMatch[2].toLowerCase();
            
            if (unit === 'minute') triggerTime.setMinutes(now.getMinutes() + amount);
            else if (unit === 'hour') triggerTime.setHours(now.getHours() + amount);
            else if (unit === 'day') triggerTime.setDate(now.getDate() + amount);
            else if (unit === 'week') triggerTime.setDate(now.getDate() + (amount * 7));
          }
        }
        
        const timeoutId = setExactReminder(reminderText, triggerTime);
        if (timeoutId) {
          const response = `Reminder set for ${triggerTime.toLocaleTimeString()}: ${reminderText}`;
          toast.success(response);
          speakText(response, handleVoiceCommand);
        }
      } else {
        const reminderError = 'I could not parse reminder details. Please say "Set a reminder to [Your task]".';
        toast.error(reminderError);
        speakText(reminderError, handleVoiceCommand);
      }
    }
    // --- Weather Forecast ---
    else if (lowerCommand.includes('weather') || lowerCommand.includes('forecast')) {
      const locationMatch = lowerCommand.match(/(?:in|for|at) (.+?)(?: today| tomorrow|$)/i);
      const location = locationMatch ? locationMatch[1].trim() : "your location";
      
      try {
        const response = await axios.post('http://localhost:5000/api/ai/query', {
          prompt: `weather in ${location}`,
          userId: currentUser?.uid
        });
        
        speakText(response.data.response, handleVoiceCommand);
      } catch (error) {
        console.error('Weather error:', error);
        speakText("Couldn't retrieve weather information. Please check your connection and try again.", handleVoiceCommand);
      }
      return;
    }
    // --- Nigerian States ---
    else if (lowerCommand.includes('nigerian states') || lowerCommand.includes('states in nigeria')) {
      const response = `Nigeria has 36 states: ${nigerianStates.join(', ')}.`;
      toast.info(response);
      speakText(response, handleVoiceCommand);
      return;
    }
    // --- Location/Directions ---
    else if (lowerCommand.includes('where is') || 
             lowerCommand.includes('how far') || 
             lowerCommand.includes('directions to')) {
      const location = command.replace(/(where is|how far is|directions to)/i, '').trim();
      
      try {
        const response = await axios.post('http://localhost:5000/api/ai/query', {
          prompt: `directions to ${location}`,
          userId: currentUser?.uid
        });
        
        speakText(response.data.response, handleVoiceCommand);
      } catch (error) {
        console.error('Directions error:', error);
        speakText("Couldn't retrieve location information. Please check your connection and try again.", handleVoiceCommand);
      }
      return;
    }
    // --- General Knowledge ---
    else {
      setMessage(chappieInfo.generalKnowledgeIntro);
      toast.info("Chappie: " + chappieInfo.generalKnowledgeIntro, { autoClose: 2000 });

      try {
        const response = await axios.post('http://localhost:5000/api/ai/query', {
          prompt: command,
          userId: currentUser?.uid || 'anonymous'
        });

        const aiResponse = response.data.response;

        if (aiResponse) {
          setMessage(`Chappie says: "${aiResponse}"`);
          speakText(aiResponse, handleVoiceCommand);
        } else {
          const errorResponse = "I'm sorry, I couldn't generate a response for that. Please try rephrasing.";
          setMessage(errorResponse);
          speakText(errorResponse, handleVoiceCommand);
        }
      } catch (error) {
        console.error('Backend AI query failed:', error);
        const apiErrorMessage = "I'm having trouble connecting to my knowledge base. Please check your connection and try again later.";
        setMessage(apiErrorMessage);
        toast.error(
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-400" />
            <span>{apiErrorMessage}</span>
          </div>,
          { autoClose: false, closeOnClick: false }
        );
        speakText(apiErrorMessage, handleVoiceCommand);
      }
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-800 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center text-center w-full">
        <h2 className="text-4xl font-extrabold text-white mb-6 animate-pulse">
          AI Assistant: {chappieInfo.name} ✨
        </h2>
        
         <p className="text-purple-200 mb-8 max-w-xl leading-relaxed">
          I am <span className="font-semibold">{chappieInfo.name}</span>, your AI personal assistant. Click the microphone and speak your command.
          You can ask me about directions, locations to <strong className="text-amber-300">book an appointment</strong> (e.g., Book an appointment for tomorrow at 2 PM in London) or <strong className="text-amber-300">set a reminder</strong> (e.g., Set a reminder to call John).
          I can also answer general questions by leveraging multiple advanced AI models!
        </p>
        
        <div className="relative w-72 h-72 flex items-center justify-center mb-8">
          <motion.div
            animate={isListening ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] } : { scale: 1, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-full h-full rounded-full bg-amber-500/30"
          />
          
          <canvas
            ref={canvasRef}
            width="256"
            height="128"
            className="absolute z-0 rounded-full"
            style={{
              opacity: isListening ? 1 : 0,
              transition: 'opacity 0.5s',
              width: 'calc(100% - 40px)',
              height: 'calc(100% - 40px)',
              filter: 'blur(5px)',
              transform: 'rotateX(60deg) scale(0.9)'
            }}
          />
          
          <Button
            onClick={handleVoiceCommand}
            disabled={isSpeaking}
            className="relative z-10 mic-button rounded-full shadow-2xl"
          >
            <Mic className={`w-16 h-16 md:w-20 md:h-20 text-white transition-transform ${isListening ? 'scale-110' : ''} group-hover:scale-110`} />
            {isListening && (
              <motion.span
                className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </Button>
        </div>

        <div className="mt-8 max-w-lg w-full text-center">
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-900 rounded-xl shadow-lg border border-purple-700 mb-4"
            >
              <p className="text-amber-400 font-semibold flex items-center justify-center space-x-2">
                <Command className="w-5 h-5 text-amber-500"/>
                <span>Last Command:</span>
              </p>
              <p className="mt-2 text-white text-lg italic">{transcript}</p>
            </motion.div>
          )}
          
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-md text-purple-300 flex items-center justify-center gap-2 px-4"
            >
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="font-medium">{message}</span>
            </motion.p>
          )}
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-slate-800 p-3 rounded-lg flex flex-col items-center">
              <MapPin className="text-amber-400 mb-2" />
              <span className="text-sm">Directions</span>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg flex flex-col items-center">
              <Cloud className="text-amber-400 mb-2" />
              <span className="text-sm">Weather</span>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg flex flex-col items-center">
              <Calendar className="text-amber-400 mb-2" />
              <span className="text-sm">Reminders</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantPage;