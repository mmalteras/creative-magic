
import { useEffect } from 'react';

// יצירת צליל עדין באמצעות Web Audio API
const createNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const playSound = () => {
      // יצירת oscillator לצליל
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // הגדרת תדר גבוה יותר ונעים (A5 - 880 Hz)
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.type = 'sine'; // צליל עדין
      
      // הגדרת עוצמה חזקה יותר ועלייה/ירידה חלקה
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      // הגברה משמעותית של העוצמה ל-0.6 (במקום 0.1)
      gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.05);
      // הארכת זמן הדעיכה
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
      
      // חיבור הצלילים
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // השמעה וסיום
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4); // התאמת זמן הסיום
    };
    
    return playSound;
  } catch (error) {
    console.warn('Audio not supported:', error);
    return () => {}; // פונקציה ריקה אם אין תמיכה
  }
};

let soundPlayer = null;

const NotificationSound = {
  init: () => {
    if (!soundPlayer) {
      soundPlayer = createNotificationSound();
    }
  },
  
  play: () => {
    if (soundPlayer) {
      try {
        soundPlayer();
      } catch (error) {
        console.warn('Failed to play notification sound:', error);
      }
    }
  }
};

// Hook להפעלת הצליל
export const useNotificationSound = () => {
  useEffect(() => {
    NotificationSound.init();
  }, []);

  return NotificationSound.play;
};

export default NotificationSound;
