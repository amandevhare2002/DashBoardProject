import React from 'react';

const BusBooking = () => {


  return (
    <div style={{ overflow: 'hidden' }}>
      <iframe
        title="Recharge"
        width="100%"
        height="500"
        src="https://pinki-recharge-32sp.vercel.app/"
        allowFullScreen
        style={{ border: '1px solid #ccc', overflow: 'hidden' }}
        allow="camera; microphone"
      />
    </div>
  );
};

export default BusBooking;
