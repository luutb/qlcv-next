'use client';

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';

interface ESignatureData {
  signer_name: string;
  signer_email: string;
  signature_image?: string;
  signature_date: string;
  ip_address?: string;
  user_agent?: string;
}

interface ESignaturePadProps {
  onSign?: (data: ESignatureData) => Promise<void>;
  existingSignature?: ESignatureData;
  disabled?: boolean;
}

export default function ESignaturePad({
  onSign,
  existingSignature,
  disabled = false,
}: ESignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<ESignatureData | null>(existingSignature || null);
  const [signerName, setSignerName] = useState(existingSignature?.signer_name || '');
  const [signerEmail, setSignerEmail] = useState(existingSignature?.signer_email || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingSignature) {
      setSignatureData(existingSignature);
      setSignerName(existingSignature.signer_name);
      setSignerEmail(existingSignature.signer_email);
    }
  }, [existingSignature]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setSignatureData(null);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setSignatureData({
        signer_name: signerName,
        signer_email: signerEmail,
        signature_image: dataUrl,
        signature_date: new Date().toISOString(),
      });
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const handleSign = async () => {
    if (!signerName.trim()) {
      setError('Vui lòng nhập họ tên người ký');
      return;
    }
    if (!signatureData?.signature_image) {
      setError('Vui lòng ký vào ô bên dưới');
      return;
    }

    if (onSign) {
      try {
        await onSign({
          ...signatureData,
          signer_name: signerName,
          signer_email: signerEmail,
        });
        setError(null);
      } catch (err) {
        setError('Ký thất bại');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">Chữ ký số</Typography>
        {signatureData && (
          <Typography variant="caption" color="success.main">
            Đã ký
          </Typography>
        )}
      </Box>

      {signatureData ? (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Người ký: {signatureData.signer_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(signatureData.signature_date).toLocaleString('vi-VN')}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <img
            src={signatureData.signature_image}
            alt="Chữ ký"
            style={{ maxWidth: '100%', maxHeight: 150 }}
          />
          {!disabled && (
            <Button
              size="small"
              color="error"
              onClick={clearCanvas}
              sx={{ mt: 1 }}
            >
              Xóa chữ ký
            </Button>
          )}
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            style={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              cursor: isDrawing ? 'crosshair' : 'default',
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!disabled && (
            <Button
              size="small"
              color="error"
              onClick={clearCanvas}
              sx={{ mt: 1 }}
            >
              Xóa tất cả
            </Button>
          )}
        </Paper>
      )}

      {/* Signer Information */}
      {!disabled && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Họ tên người ký"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            size="small"
            label="Email người ký"
            type="email"
            value={signerEmail}
            onChange={(e) => setSignerEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Sign Button */}
      {!disabled && !signatureData && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSign}
          disabled={!signerName.trim()}
          sx={{ mt: 2 }}
        >
          Ký hợp đồng
        </Button>
      )}
    </Box>
  );
}
