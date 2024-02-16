import React, { useState, useRef } from 'react';

const WebcamCapture = ({ onBlob }) => {
  const videoRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordAudioOnly, setRecordAudioOnly] = useState(false);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !recordAudioOnly,
        audio: true,
      });

      setMediaStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing camera and microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaStream) {
      const tracks = mediaStream.getTracks();
      tracks.forEach(track => track.stop());
      setMediaStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      const blob = new Blob([event.data], { type: recordAudioOnly ? 'audio/wav' : 'video/webm' });
      console.log(blob);
      const fileName= recordAudioOnly ? 'rec.wav' : 'rec.webm';
      const file = new File( [ blob ], fileName,  { type: recordAudioOnly ? 'audio/wav' : 'video/webm' } );
      setRecordedBlob(blob);
      onBlob(file);
    }
  };

  return (
    <div>
      <label for="check"> Record Audio Only</label>
      <input id="check" name='check' type="checkbox" checked={recordAudioOnly} onChange={() => setRecordAudioOnly(!recordAudioOnly)}/>
      {recordedBlob ? (
        <div>
          <h3>Recorded {recordAudioOnly ? 'Audio' : 'Video'}</h3>
          {recordAudioOnly ? (
            <audio controls src={URL.createObjectURL(recordedBlob)} />
          ) : (
            <video controls width="300" src={URL.createObjectURL(recordedBlob)} />
          )}
          <br></br>
          <button style={{backgroundColor:"skyblue"}} onClick={()=>{setRecordedBlob(null)}}>Clear</button>
        </div>
      ) : (
        <div>
          <video ref={videoRef} autoPlay playsInline muted={!recordAudioOnly} style={{ maxWidth: '100%' }} />
        </div>
      )}
        <button style={{backgroundColor:"blue",margin:"10px"}} onClick={startRecording}>Start Recording </button>
        <button style={{backgroundColor:"blue"}} onClick={stopRecording}>Stop Recording</button>
      <div>
        
      </div>
    </div>
  );
};

export default WebcamCapture;
