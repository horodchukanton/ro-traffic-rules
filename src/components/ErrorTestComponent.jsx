import React, { useState } from 'react';

/**
 * Component that deliberately throws an error for testing ErrorBoundary
 * Only used for demonstration purposes
 */
function ErrorTestComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary demonstration');
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', margin: '1rem 0' }}>
      <h4>Error Boundary Test Component</h4>
      <p>This component can simulate an error to test the ErrorBoundary.</p>
      <button 
        onClick={() => setShouldThrow(true)}
        style={{
          background: '#d32f2f',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Trigger Error
      </button>
    </div>
  );
}

export default ErrorTestComponent;