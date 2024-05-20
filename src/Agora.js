
// import React, { useEffect, useRef, useState } from 'react';
// import AgoraRTC from 'agora-rtc-sdk-ng';
// import { AGORA_APP_ID ,AGORA_TOKEN } from './agoraConfig';
// import './App.css';

// import { AIDenoiserExtension } from 'agora-extension-ai-denoiser';
// import { SpatialAudioExtension } from 'agora-extension-spatial-audio';
// import { VirtualBackgroundExtension } from 'agora-extension-virtual-background'
// const aiDenoiserExtension = new AIDenoiserExtension();
// const spatialAudioExtension = new SpatialAudioExtension();
// const virtualBackgroundExtension = new VirtualBackgroundExtension();

// AgoraRTC.registerExtensions([
//   aiDenoiserExtension,
//   spatialAudioExtension,
//   virtualBackgroundExtension,
// ]);

// const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
// const Agora = () => {
//     const [joined, setJoined] = useState(false);
//   const [localTrack, setLocalTrack] = useState(null);
//   const [remoteTracks, setRemoteTracks] = useState([]);
//   const localVideoRef = useRef(null);

//   useEffect(() => {
//     if (joined && localTrack) {
//       localTrack.play(localVideoRef.current);
//     }
//   }, [joined, localTrack]);

//   const handleJoin = async () => {
//     await client.join(AGORA_APP_ID, 'test-channel', AGORA_TOKEN, null);

//     // Initialize local track with extensions
//     const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
//     await aiDenoiserExtension.enableDenoiser(audioTrack);
//     await spatialAudioExtension.setSpatialAudioEnvironment(audioTrack);
//     await virtualBackgroundExtension.setVirtualBackground(videoTrack, { source: 'path/to/image.jpg' });

//     setLocalTrack(videoTrack);

//     client.on('user-published', async (user, mediaType) => {
//       await client.subscribe(user, mediaType);
//       if (mediaType === 'video') {
//         const remoteVideoTrack = user.videoTrack;
//         setRemoteTracks(prevTracks => [...prevTracks, remoteVideoTrack]);
//       }
//     });

//     setJoined(true);
//   };

//   const handleLeave = async () => {
//     localTrack.stop();
//     localTrack.close();
//     await client.leave();
//     setLocalTrack(null);
//     setRemoteTracks([]);
//     setJoined(false);
//   };
//   return (
//     <div>Agora<div className="App">
//     <h1>Agora Video Call</h1>
//     <div className="videos">
//       <div className="local-video">
//         <h2>Local</h2>
//         <div ref={localVideoRef} className="video"></div>
//       </div>
//       <div className="remote-videos">
//         <h2>Remote</h2>
//         {remoteTracks.map((track, index) => (
//           <div key={index} className="video" ref={(el) => track && track.play(el)}></div>
//         ))}
//       </div>
//     </div>
//     <div className="controls">
//       {!joined ? (
//         <button onClick={handleJoin}>Join</button>
//       ) : (
//         <button onClick={handleLeave}>Leave</button>
//       )}
//     </div>
//   </div></div>
//   )
// }

// export default Agora