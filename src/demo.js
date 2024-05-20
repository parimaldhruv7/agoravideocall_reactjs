in this code all work fine only problem is in reciever side sender screen not show give reasion  and solve this problem 
AgoraServices.js=>import AgoraRTC from 'agora-rtc-sdk-ng';
import VirtualBackgroundExtension from 'agora-extension-virtual-background';
import bg4 from './images/bg4.webp';

const rtc = {
  client: null,
  localAudioTrack: null,
  localVideoTrack: null,
  remoteUsers: [],
  processor: null, // Added processor to rtc object
};

const options = {
  appId: '34e0c29462784e44928ce15c76840cbc', // Replace with your Agora App ID
  token: null, // Token can be generated for more secure communication
};

const initialize = async (localVideoRef, channel) => {
  try {
    rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    await rtc.client.join(options.appId, channel, options.token, null);

    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    const extension = new VirtualBackgroundExtension();
    AgoraRTC.registerExtensions([extension]);

    rtc.processor = extension.createProcessor();
    await rtc.processor.init('./assets/wasms'); // Make sure to provide the correct path to the WASM file

    rtc.localVideoTrack.pipe(rtc.processor).pipe(rtc.localVideoTrack.processorDestination);
    rtc.processor.enable(); // Enable the virtual background processor

    await rtc.processor.setOptions({
      type: 'color',
      color: '#00FF00', // Default background color
    });

    rtc.localVideoTrack.play(localVideoRef.current);

    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);

    rtc.client.on('user-published', async (user, mediaType) => {
      await rtc.client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        const existingUserContainer = rtc.remoteUsers.find(u => u.uid === user.uid);
    
        if (existingUserContainer) {
          // If the user already has a container, reuse it
          remoteVideoTrack.play(existingUserContainer.container);
        } else {
          // If the user is new, create a new container
          const remoteContainer = document.createElement('div');
          remoteContainer.id = user.uid.toString();
          remoteContainer.style.width = '300px';
          remoteContainer.style.height = '300px';
          document.getElementById('remoteVideoGrid').append(remoteContainer);
          remoteVideoTrack.play(remoteContainer);
          rtc.remoteUsers.push({ uid: user.uid, container: remoteContainer });
        }
      }
    });

    rtc.client.on('user-unpublished', user => {
      const remoteContainer = document.getElementById(user.uid.toString());
      if (remoteContainer) {
        remoteContainer.remove();
      }
    });
  } catch (error) {
    console.error('Failed to initialize AgoraRTC client', error);
    throw error;
  }
};

const leave = async () => {
  try {
    if (rtc.localAudioTrack) {
      rtc.localAudioTrack.stop();
      rtc.localAudioTrack.close();
    }

    if (rtc.localVideoTrack) {
      rtc.localVideoTrack.stop();
      rtc.localVideoTrack.close();
    }

    rtc.remoteUsers.forEach(user => {
      const remoteContainer = document.getElementById(user.uid.toString());
      if (remoteContainer) {
        remoteContainer.remove();
      }
    });

    if (rtc.client) {
      await rtc.client.leave();
    }
  } catch (error) {
    console.error('Failed to leave the call', error);
    throw error;
  }
};

const getProcessorInstance = async () => {
  if (!rtc.processor && rtc.localVideoTrack) {
    const extension = new VirtualBackgroundExtension();
    rtc.processor = extension.createProcessor();
    await rtc.processor.init('./assets/wasms');
    rtc.localVideoTrack.pipe(rtc.processor).pipe(rtc.localVideoTrack.processorDestination);
  }
  return rtc.processor;
};

export { initialize, leave, rtc, getProcessorInstance };
ConnectForm.js=>
    import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ConnectForm = () => {
  const [channelName, setChannelName] = useState('');
  const navigate = useNavigate();

  const handleConnect = (e) => {
    e.preventDefault();
    const trimmedChannelName = channelName.trim();
    if (trimmedChannelName && trimmedChannelName.toLowerCase() !== 'null') {
      navigate(`/call/${trimmedChannelName}`);
    } else {
      alert('Channel name cannot be empty or "null"');
    }
  };

  return (
    <form onSubmit={handleConnect}>
      <div>
        <input
          type="text"
          placeholder="Enter Channel Name"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
        />
        <button type="submit">Connect</button>
      </div>
    </form>
  );
};

export default ConnectForm;
Call.js=>import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initialize, leave, rtc, getProcessorInstance } from './AgoraService';
import bg1 from './images/bg1.png';
import bg2 from './images/bg2.jpg';
import bg3 from './images/bg3.jpg';
import bg4 from './images/bg4.webp';
import bg5 from './images/bg5.png';

const Call = () => {
  const { channelName } = useParams();
  const localVideoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!channelName || channelName.toLowerCase() === 'null') {
      alert('Invalid channel name');
      navigate('/');
    }
  }, [channelName, navigate]);

  const startCall = async () => {
    try {
      await initialize(localVideoRef, channelName);
      console.log('Call started');
    } catch (error) {
      console.error('Error starting the call:', error);
    }
  };

  const endCall = async () => {
    try {
      await leave();
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
        console.log('Options:', options);

        if (type === 'color') {
          options.type = 'color';
          options.color = value;
        } else if (type === 'blur') {
          options.type = 'blur';
          options.blurDegree = value;
        } else if (type === 'image') {

          const img2 = document.createElement("img"); 
             img2.src = value;
            img2.alt = "alt text";
         const Image= document.body.appendChild(img2);

          options.type = 'img';
          options.source = Image
        } else {
          console.error('Invalid background type');
          return;
        }

        await processor.setOptions(options);
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
        <button onClick={startCall} style={{ marginRight: '10px' }}>Start Call</button>
        <button onClick={endCall}>End Call</button>
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
App.js=>import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ConnectForm from './ConnectForm';
import Call from './Call';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConnectForm />} />
        <Route path="/call/:channelName" element={<Call />} />
      </Routes>
    </Router>
  );
};

export default App;