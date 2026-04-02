// components/GlobalIframe.tsx
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';


interface IframeEventDetail {
  action: 'TOGGLE_IFRAME' | 'SHOW_IFRAME' | 'HIDE_IFRAME';
}

// Global state to track iframe visibility
let iframeVisible = false;
const subscribers: Array<(visible: boolean) => void> = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback(iframeVisible));
};

export const showIframe = (): void => {
  iframeVisible = true;
  notifySubscribers();
};

export const hideIframe = (): void => {
  iframeVisible = false;
  notifySubscribers();
};

const GlobalIframe = () => {
  const [isVisible, setIsVisible] = useState<boolean>(iframeVisible);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeURL = sessionStorage.getItem('IFRAME');
  useEffect(() => {
    const handleSubscription = (visible: boolean) => {
      setIsVisible(visible);
    };

    subscribers.push(handleSubscription);

    return () => {
      const index = subscribers.indexOf(handleSubscription);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        hideIframe();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  // Don't return null - always render but control visibility with CSS
  return (
    <>
      {/* Overlay - only show when visible */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9998,
            backdropFilter: 'blur(2px)'
          }}
          onClick={hideIframe}
        />
      )}

      {/* Popup Iframe - always in DOM but hidden when not visible */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: isVisible ? 'translate(-50%, -50%)' : 'translate(-50%, -150%)', // Move off-screen when hidden
        width: '95vw',
        height: '90vh',
        zIndex: 9999,
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '12px',
        boxShadow: isVisible ? '0 10px 50px rgba(0,0,0,0.5)' : 'none',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transition: 'all 0.3s ease' // Smooth transition
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            📞 Vicidial Dialer
          </h3>
          <button
            onClick={hideIframe}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            ×
          </button>
        </div>

        {/* Iframe - always loaded, never unmounted */}
        <iframe
          ref={iframeRef}
          src={iframeURL as string}
          style={{
            width: '100%',
            height: 'calc(100% - 60px)',
            border: 'none',
            display: 'block'
          }}
          allow="camera; microphone"
          title="Vicidial Dialer"
          // Important: These props prevent iframe from reloading
          onLoad={() => console.log('Iframe loaded - session preserved')}
        />
      </div>
    </>
  );
};

export default GlobalIframe;