import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface TransferQRGeneratorProps {
  data: string;
  size?: number;
}

export const TransferQRGenerator: React.FC<TransferQRGeneratorProps> = ({
  data,
  size = 256
}) => {
  return (
    <div className="flex justify-center">
      <QRCodeSVG
        value={data}
        size={size}
        level="M"
        includeMargin={true}
      />
    </div>
  );
};

export default TransferQRGenerator;