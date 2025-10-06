'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Camera, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkCameraPermission();
    return () => {
      // Cleanup camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setHasPermission(permission.state === 'granted');
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      setHasPermission(null);
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setIsProcessing(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setHasPermission(true);
      
      // Start QR code detection
      startQRDetection();
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      setIsScanning(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Camera permission denied. Please allow camera access to scan QR codes.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera found on this device.');
        } else {
          toast.error('Failed to access camera. Please try again.');
        }
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startQRDetection = () => {
    // This would integrate with a QR code detection library
    // For now, we'll simulate the detection process
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context || !videoRef.current) return;

    const detectQR = () => {
      if (!isScanning || !videoRef.current || videoRef.current.videoWidth === 0) {
        if (isScanning) {
          requestAnimationFrame(detectQR);
        }
        return;
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Here you would use a QR code detection library like jsQR
      // For demo purposes, we'll simulate a successful scan after a few seconds
      setTimeout(() => {
        if (isScanning) {
          handleQRCodeDetected('demo-table-123-demo-restaurant-456');
        }
      }, 3000);
    };

    requestAnimationFrame(detectQR);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    setScanResult(qrData);
    setIsProcessing(true);
    stopScanning();

    try {
      // Parse QR code data
      const parts = qrData.split('-');
      if (parts.length < 4) {
        throw new Error('Invalid QR code format');
      }

      const tableId = parts.slice(0, -2).join('-');
      const restaurantId = parts.slice(-2).join('-');

      // Validate and process the QR code
      const response = await fetch('/api/scan/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCode: qrData,
          tableId,
          restaurantId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate QR code');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Table found! Redirecting to menu...');
        
        // Redirect to menu page with session data
        router.push(`/menu?session=${data.sessionId}&table=${tableId}&restaurant=${restaurantId}`);
      } else {
        throw new Error(data.message || 'Invalid QR code');
      }
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Invalid QR code. Please scan a valid table QR code.');
      
      // Reset and allow scanning again
      setScanResult(null);
      setIsProcessing(false);
      setTimeout(() => {
        startScanning();
      }, 2000);
    }
  };

  const requestPermission = async () => {
    try {
      await startScanning();
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Camera Permission Required
            </h1>
            
            <p className="text-gray-600 mb-6">
              We need access to your camera to scan QR codes. Please enable camera permissions and try again.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={requestPermission}
                className="btn btn-primary w-full"
              >
                <Camera className="w-5 h-5 mr-2" />
                Allow Camera Access
              </button>
              
              <Link href="/" className="btn btn-outline w-full">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            
            <h1 className="text-lg font-semibold text-gray-900">Scan QR Code</h1>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Scanner */}
      <div className="container-app py-8">
        <div className="max-w-md mx-auto">
          <div className="card p-6 text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-primary-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Scan Table QR Code
            </h2>
            
            <p className="text-gray-600">
              Point your camera at the QR code on your table to start ordering
            </p>
          </div>

          {/* Camera View */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-square mb-6">
            {!isScanning && !isProcessing ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg opacity-75">Camera Ready</p>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
                  <p className="text-lg">Processing QR Code...</p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* QR Code Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-400 rounded-br-lg"></div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          {!isScanning && !isProcessing && (
            <div className="space-y-4">
              <button
                onClick={startScanning}
                className="btn btn-primary w-full"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Scanning
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Don't have a QR code?</p>
                <Link href="/demo" className="text-primary-600 hover:text-primary-700 font-medium">
                  Try Demo Mode
                </Link>
              </div>
            </div>
          )}

          {isScanning && (
            <button
              onClick={stopScanning}
              className="btn btn-outline w-full"
            >
              Stop Scanning
            </button>
          )}

          {/* Instructions */}
          <div className="mt-8 space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 font-semibold text-xs">1</span>
              </div>
              <p>Find the QR code on your table</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 font-semibold text-xs">2</span>
              </div>
              <p>Point your camera at the QR code</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 font-semibold text-xs">3</span>
              </div>
              <p>Wait for the code to be recognized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
