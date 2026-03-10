'use client';

import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import SignaturePad from 'signature_pad';

interface SignatureCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string, signerName: string) => Promise<void>;
  documentTitle: string;
}

export default function SignatureCanvas({
  isOpen,
  onClose,
  onSave,
  documentTitle,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [signerName, setSignerName] = useState('');
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  useEffect(() => {
    if (isOpen && canvasRef.current && mode === 'draw') {
      const canvas = canvasRef.current;
      // Set canvas dimensions to match display size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
      });

      return () => {
        signaturePadRef.current?.off();
        signaturePadRef.current = null;
      };
    }
  }, [isOpen, mode]);

  const handleClear = () => {
    if (mode === 'draw') {
      signaturePadRef.current?.clear();
    } else {
      setTypedSignature('');
    }
  };

  const handleClose = () => {
    setSignerName('');
    setTypedSignature('');
    setError('');
    setMode('draw');
    onClose();
  };

  const handleSave = async () => {
    if (!signerName.trim()) {
      setError('Please enter your name.');
      return;
    }

    let signatureData = '';

    if (mode === 'draw') {
      if (signaturePadRef.current?.isEmpty()) {
        setError('Please draw your signature.');
        return;
      }
      signatureData = signaturePadRef.current?.toDataURL('image/png') || '';
    } else {
      if (!typedSignature.trim()) {
        setError('Please type your signature.');
        return;
      }
      // For typed signatures, encode as a data URL with the text
      signatureData = `typed:${typedSignature.trim()}`;
    }

    setSaving(true);
    setError('');

    try {
      await onSave(signatureData, signerName.trim());
      handleClose();
    } catch {
      setError('Failed to save signature. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sign Document" maxWidth="max-w-xl">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-background rounded-md p-3 border border-border">
          <p className="text-sm text-foreground">
            Signing: <span className="font-medium">{documentTitle}</span>
          </p>
        </div>

        {/* Signer name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            maxLength={200}
            placeholder="Enter your full name"
            className={inputClass}
          />
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('draw')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              mode === 'draw'
                ? 'bg-primary text-white'
                : 'border border-border text-foreground hover:bg-background'
            }`}
          >
            Draw
          </button>
          <button
            onClick={() => setMode('type')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              mode === 'type'
                ? 'bg-primary text-white'
                : 'border border-border text-foreground hover:bg-background'
            }`}
          >
            Type
          </button>
        </div>

        {/* Signature area */}
        {mode === 'draw' ? (
          <div className="border border-border rounded-md overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ height: '160px', touchAction: 'none' }}
            />
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              placeholder="Type your signature"
              maxLength={200}
              className={inputClass}
              style={{ fontFamily: "'Brush Script MT', cursive", fontSize: '24px' }}
            />
            {typedSignature && (
              <div className="mt-2 p-4 border border-border rounded-md bg-white text-center">
                <span
                  style={{
                    fontFamily: "'Brush Script MT', cursive",
                    fontSize: '32px',
                    color: '#000',
                  }}
                >
                  {typedSignature}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm border border-border text-foreground rounded-md hover:bg-background transition-colors"
          >
            Clear
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !signerName.trim()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Signature'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
