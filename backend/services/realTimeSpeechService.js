import WebSocket from 'ws';
import wavefile from 'wavefile';

const deepgramTTSWebsocketURL = 'wss://api.deepgram.com/v1/speak?encoding=mulaw&sample_rate=8000&container=none';

export const textToSpeechService = (connection, config) => {
  let chunks = [];
  const options = {
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`
    }
  };

  const ws = new WebSocket(deepgramTTSWebsocketURL, options);

  ws.on('open', function open() {
    console.log('deepgram TTS: Connected to the WebSocket server');
  });

  ws.on('message', function incoming(data) {
    // Handles barge in
    if (!config.stopStream) {
      try {
        let json = JSON.parse(data.toString());
        console.log('deepgram TTS: ', data.toString());
        return;
      } catch (e) {
        // Ignore
      }


      const buffer = Buffer.from(data);
      // chunks.push(buffer);

      // if(chunks.length >= 2){
      //   const mergeBuffer = Buffer.concat(chunks);
      //   const wav = new wavefile.WaveFile();
      //   wav.fromScratch(1, 8000, '8m', mergeBuffer);
      //   const payload = wav.toBase64();

      //   const sendData = {
      //     event: 'media',
      //     media: {
      //       payload
      //     }
      //   }

      //   connection.send(JSON.stringify(sendData));
      //   chunks = [];
      // }
      const wav = new wavefile.WaveFile();
      wav.fromScratch(1, 8000, '8m', buffer);
      wav.fromMuLaw();
      wav.toSampleRate(16000);
      const payload = Buffer.from(wav.data.samples ).toString('base64');

      const sendData = {
        event: 'media',
        media: {
          payload
        }
      }
      connection.send(JSON.stringify(sendData));
    }
  });

  ws.on('close', function close() {
    console.log('deepgram TTS: Disconnected from the WebSocket server');
  });

  ws.on('error', function error(error) {
    console.log("deepgram TTS: error received");
    console.error(error);
  });
  return ws;
}