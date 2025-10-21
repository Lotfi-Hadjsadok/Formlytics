import React, { useEffect, useRef } from 'react';

const FormlyticsForm = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'resize' && iframeRef.current) {
        iframeRef.current.style.height = event.data.height + 'px';
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="http://localhost:3000/forms/cmgzovt8k00019kuttx693azj/embed"
      width="100%"
      height="400"
      frameBorder="0"
      style={{ border: 'none' }}
    />
  );
};

export default FormlyticsForm;