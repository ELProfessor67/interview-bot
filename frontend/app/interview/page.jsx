'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, MoreVertical } from 'lucide-react'
import SoundWave from '@/components/SoundWave';
import { useRouter } from 'next/navigation';
import { audioContext, base64ToArrayBuffer } from '@/lib/utils';
import { AudioStreamer } from '@/services/audioStreamer';
import VolMeterWorket from '@/services/workers/volMeter';
import AudioPulse from '@/components/AudioPulse';
// import { VideoSDKNoiseSuppressor } from "@videosdk.live/videosdk-media-processor-web";
import { useStateContext } from '@/contexts/StateContext';


const App = () => {
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const mediaRecorderRef = useRef(null);
  const websocketRef = useRef();
  const router = useRouter();
  const streamRef = useRef(null);
  const [volume, setVolume] = useState(0);
  const audioStreamerRef = useRef(null);
  // const noiseProcessor = new VideoSDKNoiseSuppressor.VideoSDKNoiseSuppressor();
  const noiseProcessor = useRef(null);
  const { sections, finalPrompt } = useStateContext();
  const [transcriptions, setTranscriptions] = useState([]);


  const downloadTranscription = (transcriptionArray) => {
    const textContent = transcriptionArray.join("\n\n\n"); // Join with new lines
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Create a temporary <a> element
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.txt";
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  useEffect(() => {
    async function loadNoiseSuppressor() {
      const module = await import("@videosdk.live/videosdk-media-processor-web");
      noiseProcessor.current = new module.VideoSDKNoiseSuppressor();
    }

    loadNoiseSuppressor();
  }, []);


  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: "audio-out", sampleRate: 16000 }).then((audioCtx) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet("vumeter-out", VolMeterWorket, (ev) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            console.log('successfully initialize');
          });
      });
    }
  }, [audioStreamerRef]);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        if (isMuted) {
          audioTrack.enabled = true;
          setIsMuted(false);
        } else {
          audioTrack.enabled = false;
          setIsMuted(true);
        }
      }
    }
  }, [isMuted])

  const endCall = useCallback(() => {
    downloadTranscription(transcriptions);
    websocketRef.current?.close();
    audioStreamerRef.current.stop();
    router.push('/');
    streamRef.current.getAudioTracks().forEach((track) => track.stop());
  }, [transcriptions]);


  const onConnect = useCallback(() => {
    console.log('connected')
    const data = {
      event: 'start',
      start: {
        user: {
          name: "Manan Rajpout",
        },
        sections: sections,
        system_prompt: finalPrompt
      }
    }
    websocketRef.current.send(JSON.stringify(data));
    setTimeout(() => sendStream(), 4000);
  }, [])



  useEffect(() => {
    if (websocketRef.current) return;
    const ws = new WebSocket(process.env.NEXT_PUBLIC_MEDIA_SERVER_URL);
    websocketRef.current = ws;
    ws.onopen = onConnect;
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      switch (data.event) {
        case 'media':
          const base64Audio = data.media.payload;

          const buffer = base64ToArrayBuffer(base64Audio);
          console.log(buffer.byteLength)
          audioStreamerRef.current?.addPCM16(new Uint8Array(buffer));
          break;
        case 'clear':
          audioStreamerRef.current.stop();
          break;
        case 'transcription':
          console.log("transcriptiondata", data.transcription);
          setTranscriptions(prev => [...prev, data.transcription]);
          break;
      }
    };

    ws.onclose = () => {
      console.log('close');
    }

    // return () => {
    //   ws.close();
    // };
  }, []);








  const sendStream = async () => {
    console.log("start voice called");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    // Get user audio stream
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 8000
      }
    });

    const processedStream = await noiseProcessor.current.getNoiseSuppressedAudioStream(
      streamRef.current
    );


    mediaRecorderRef.current = new MediaRecorder(processedStream);
    mediaRecorderRef.current.ondataavailable = async (event) => {

      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        const blob = event.data;
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState == 2) {
            const data = {
              event: 'media',
              media: {
                payload: reader?.result?.split('base64,')[1]
              }
            }
            websocketRef.current.send(JSON.stringify(data));
          }
        }
        reader.readAsDataURL(blob);
      }
    };

    mediaRecorderRef.current.start(100);
  };
  return (
    <>
      <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
        {/* Header */}
        <header className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Interviewer</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto p-4 flex flex-col items-center justify-center">
          {/* AI Assistant and Audio Visualizer */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center space-y-6 w-full max-w-2xl">
            <div className={`relative w-48 h-48 ${isAISpeaking ? 'animate-pulse' : ''}`}>
              <div className="absolute inset-0 bg-indigo-300 rounded-full opacity-50"></div>
              <div className="absolute inset-2 bg-indigo-100 rounded-full flex items-center justify-center">
                <img
                  src="/bot-icon.webp"
                  alt="AI Assistant"
                  className="w-32 h-32 rounded-full"
                />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-indigo-700">AI Assistant</h2>
            {/* Audio Visualizer */}
            <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden grid place-items-center">

              <SoundWave isAnimating={isAISpeaking} />
            </div>
          </div>
        </main>

        {/* Control Bar */}
        <div className="bg-white shadow-lg p-4">
          <div className="container mx-auto flex justify-center items-center space-x-6">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                } hover:opacity-80 transition-opacity`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <PhoneOff size={24} />
            </button>
            <button className="p-4 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
              <MoreVertical size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
