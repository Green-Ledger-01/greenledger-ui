import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';
import { QRService } from '../services/qr.service';

interface QRGeneratorProps {
  tokenId: string;
  size?: number;
  className?: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  tokenId,
  size = 200,
  className = ''
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrService = QRService.getInstance();
  
  const payload = qrService.generatePayload(tokenId);
  const qrData = qrService.encodePayload(payload);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `token-${tokenId}.png`;
      link.href = pngFile;
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Token ${tokenId}`,
          text: 'Verify this product',
          url: qrData
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(qrData);
      } catch {}
    }
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <div ref={qrRef} className="flex justify-center mb-4">
        <QRCodeSVG
          value={qrData}
          size={size}
          level="M"
          includeMargin={true}
        />
      </div>
      
      <div className="text-center text-sm text-gray-600 mb-4">
        Token: {tokenId}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={downloadQR}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-1" />
          Download
        </button>
        <button
          onClick={shareQR}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </button>
      </div>
    </div>
  );
};

export default QRGenerator;