import React, { useState, useRef, useEffect } from 'react';

interface AudioTrack {
  title: string;
  duration?: string;
  url: string;
  speaker?: string;
}

interface AudioPlayerProps {
  track: AudioTrack;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [actualDuration, setActualDuration] = useState(track.duration || '0:00');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(formatTime(audio.currentTime));
      }
    };

    const handleLoadedMetadata = () => {
      setActualDuration(formatTime(audio.duration));
      setIsLoading(false);
      setError(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime('0:00');
    };

    const handleError = () => {
      console.error("Audio playback error for URL:", track.url);
      setError(true);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [track.url]);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Playback failed:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  return (
    <div className={`bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 flex items-center gap-4 border transition-all group ${error ? 'border-red-200 bg-red-50' : 'border-slate-100 dark:border-slate-700 hover:border-primary/30'}`}>
      <audio ref={audioRef} src={track.url} preload="metadata" />

      <button
        onClick={togglePlay}
        disabled={isLoading || error}
        className={`size-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${error ? 'bg-red-100 text-red-400' : 'bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary hover:text-white'}`}
      >
        <span className="material-symbols-outlined text-2xl">
          {isLoading ? 'sync' : (error ? 'error' : (isPlaying ? 'pause' : 'play_arrow'))}
        </span>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h4 className={`font-bold text-sm truncate pr-2 ${error ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>
            {track.title} {error && '(Error playing file)'}
          </h4>
          <span className="text-[10px] text-slate-400 font-mono font-bold tracking-tighter bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded uppercase">
            {error ? 'ERR' : `${currentTime} / ${actualDuration}`}
          </span>
        </div>
        <div className="text-[10px] text-cedar font-black uppercase tracking-widest mb-3 opacity-70 group-hover:opacity-100 transition-opacity">{track.speaker}</div>

        {/* Progress Bar */}
        <div className="relative h-1.5 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </div>
    </div>
  );
};