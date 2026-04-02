import React, { useEffect } from 'react';

const BusBooking = () => {
  return (
    <div style={{}}>
      <iframe
        title="Your Iframe Title"
        width="100%"
        height="1000px"
        src="https://ephemeral-rugelach-950ea0.netlify.app/"
        // allowFullScreen
        style={{ border: '1px solid #ccc' }}
        allow="camera; microphone"
      />
    </div>
  );
};

export default BusBooking;
