/**
 * Utility functions for playing sound effects
 */

// Cache for audio elements to avoid reloading
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Load and cache an audio file
 */
function getAudio(src: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  
  if (!audioCache.has(src)) {
    try {
      const audio = new Audio(src);
      audio.volume = 0.5; // Default volume
      audio.preload = "auto";
      audioCache.set(src, audio);
    } catch {
      return null;
    }
  }
  
  return audioCache.get(src) || null;
}

/**
 * Play a click sound effect
 * Tries to use custom sound file, falls back to generated sound
 */
export function playClickSound() {
  // Try custom click sound files in order of preference
  const soundPaths = [
    "/audio/click.mp3", // Primary custom sound
  ];
  
  for (const path of soundPaths) {
    const customSound = getAudio(path);
    if (customSound) {
      try {
        customSound.currentTime = 0; // Reset to start
        const playPromise = customSound.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If this sound fails, try next one
          });
          return; // Successfully started playing
        }
      } catch {
        // Try next path
      }
    }
  }
  
  // Fallback to generated sound
  playGeneratedClickSound();
}

/**
 * Play a generated click sound using Web Audio API
 */
function playGeneratedClickSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a short, pleasant click sound
    oscillator.frequency.value = 800; // Higher pitch for click
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch {
    // Silently fail if audio context is not available
    // (e.g., user hasn't interacted with page yet)
  }
}

/**
 * Play a theme switch sound effect
 * Tries to use custom sound file, falls back to generated sound
 */
export function playThemeSwitchSound() {
  // Try custom theme switch sound files in order of preference
  const soundPaths = [
    "/audio/click.mp3",
  ];
  
  for (const path of soundPaths) {
    const customSound = getAudio(path);
    if (customSound) {
      try {
        customSound.currentTime = 0; // Reset to start
        const playPromise = customSound.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If this sound fails, try next one
          });
          return; // Successfully started playing
        }
      } catch {
        // Try next path
      }
    }
  }
  
  // Fallback to generated sound
  playGeneratedThemeSwitchSound();
}

/**
 * Play a generated theme switch sound using Web Audio API
 */
function playGeneratedThemeSwitchSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a pleasant theme switch sound
    oscillator.frequency.value = 600; // Lower pitch for theme switch
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch {
    // Silently fail if audio context is not available
  }
}

