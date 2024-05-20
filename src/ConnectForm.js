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
