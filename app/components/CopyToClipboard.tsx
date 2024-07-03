import { Button } from '@nextui-org/react';
import React from 'react';

interface CopyProps {
  textToCopy: string;
}

const CopyToClipboard: React.FC<CopyProps> = ({ textToCopy }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Button variant="solid" color="primary" onClick={handleCopy}>
      Copy
    </Button>
  );
};

export default CopyToClipboard;
