import AgoraRTC from 'agora-rtc-sdk-ng';
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
    
          // Apply virtual background processing to the remote video track
          const remoteProcessor = await getProcessorInstance();
          remoteVideoTrack.pipe(remoteProcessor).pipe(remoteVideoTrack.processorDestination);
          remoteProcessor.enable();
    
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
  if (rtc.processor && rtc.localVideoTrack) {
    rtc.localVideoTrack.processorDestination.unpipe(rtc.processor);
    rtc.processor = null;
  }

  const extension = new VirtualBackgroundExtension();
  rtc.processor = extension.createProcessor();
  await rtc.processor.init('./assets/wasms');
  rtc.localVideoTrack.pipe(rtc.processor).pipe(rtc.localVideoTrack.processorDestination);
  
  return rtc.processor;
};

export { initialize, leave, rtc, getProcessorInstance };
