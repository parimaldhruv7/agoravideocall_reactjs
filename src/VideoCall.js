// src/components/VideoCall.js
import React, { useEffect } from 'react';
import { initialize, leave } from './AgoraService';
import './App.css';

const VideoCall = () => {
  useEffect(() => {
    const init = async () => {
      await initialize();
    };
    init();

    return () => {
      leave();
    };
  }, []);

  return (
    <div>
      <h2>Agora Video Call</h2>
      <div id="local-player" style={{ width: '640px', height: '480px' }}></div>
      <div id="remote-player" style={{ width: '640px', height: '480px' }}></div>
    </div>
  );
};

export default VideoCall;
