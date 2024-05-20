import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initialize, leave, getProcessorInstance,rtc } from './AgoraService';
import bg1 from './images/bg1.png';
import bg2 from './images/bg2.jpg';
import bg3 from './images/bg3.jpg';
import bg4 from './images/bg4.webp';
import bg5 from './images/bg5.png';

const Call = () => {
  const { channelName } = useParams();
  const localVideoRef = useRef(null);
  const navigate = useNavigate();
  const [callActive, setCallActive] = useState(false);

  useEffect(() => {
    if (!channelName || channelName.toLowerCase() === 'null') {
      alert('Invalid channel name');
      navigate('/');
    }
  }, [channelName, navigate]);

  const startCall = async () => {
    try {
      await initialize(localVideoRef, channelName);
      setCallActive(true);
      console.log('Call started');
    } catch (error) {
      console.error('Error starting the call:', error);
    }
  };

  const endCall = async () => {
    try {
      await leave();
      setCallActive(false);
      console.log('Call ended');
    } catch (error) {
      console.error('Error ending the call:', error);
    }
  };

  const changeBackground = async (type, value) => {
    console.log('type', type);
    console.log('value', value);
    try {
      const processor = await getProcessorInstance();
      if (processor) {
        const options = {};
  
        if (type === 'color') {
          options.type = 'color';
          options.color = value;
        } else if (type === 'blur') {
          options.type = 'blur';
          options.blurDegree = value;
        } else if (type === 'image') {
          const img = new Image();
          img.src = value;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
  
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
  
          options.type = 'img';
          options.source = canvas;
        } else {
          console.error('Invalid background type');
          return;
        }
  
        await processor.setOptions(options);
  
        // Apply the new background settings to all remote video tracks
        rtc.remoteUsers.forEach(async (user) => {
          const remoteProcessor = await getProcessorInstance();
          await remoteProcessor.setOptions(options);
        });
  
        console.log(`Background changed: ${type === 'color' ? `color to ${value}` : type === 'blur' ? `blur degree to ${value}` : `image to ${value}`}`);
      } else {
        console.error('Processor not initialized');
        alert('Processor not initialized. Please start the call first.');
      }
    } catch (error) {
      console.error('Error changing background:', error);
    }
  };

  const changeToDefaultBackground = async () => {
    try {
      const processor = await getProcessorInstance();
      if (processor) {
        await processor.disable();
        console.log('Background reset to default');
      } else {
        console.error('Processor not initialized');
        alert('Processor not initialized. Please start the call first.');
      }
    } catch (error) {
      console.error('Error resetting background:', error);
    }
  };

  const images = [
    { id: 1, src: bg1 },
    { id: 2, src: bg2 },
    { id: 3, src: bg3 },
    { id: 4, src: bg4 },
    { id: 5, src: bg5 }
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <video ref={localVideoRef} autoPlay muted style={{ width: '300px', marginRight: '10px' }} />
        <div id="remoteVideoGrid" style={{ display: 'flex', flexWrap: 'wrap' }}></div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={startCall} disabled={callActive} style={{ marginRight: '10px' }}>Start Call</button>
        <button onClick={endCall} disabled={!callActive}>End Call</button>
        <button onClick={changeToDefaultBackground} style={{ marginRight: '10px' }}>Default Background</button>
        <button onClick={() => changeBackground('color', '#00FF00')} style={{ marginRight: '10px' }}>Green Background</button>
        <button onClick={() => changeBackground('color', '#FF0000')} style={{ marginRight: '10px' }}>Red Background</button>
        <button onClick={() => changeBackground('blur', 2)} style={{ marginRight: '10px' }}>Blur Background</button>
        <div style={{ marginTop: '20px' }}>
          <p>Background Images List</p>
          {images.map((image) => (
            <button key={image.id} onClick={() => changeBackground('image', image.src)} style={{ marginRight: '10px' }}>
              <img src={image.src} alt={`Image ${image.id}`} style={{ width: '50px', height: '50px' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Call;
