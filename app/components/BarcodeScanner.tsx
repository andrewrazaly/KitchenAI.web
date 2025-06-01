'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotification } from './Notification';

interface BarcodeScannerProps {
  onScan: (barcode: string, productInfo?: any) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [scanning, setScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  
  // Initialize camera
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment', // Prefer back camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraPermission('granted');
          setScanning(true);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setCameraPermission('denied');
        showNotification('Camera access denied. Please check your permissions.', 'error');
      }
    };
    
    setupCamera();
    
    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [showNotification]);
  
  // Perform barcode scanning
  useEffect(() => {
    let animationFrame: number;
    
    const scanBarcode = async () => {
      if (!scanning || !videoRef.current || !canvasRef.current || !videoRef.current.videoWidth) {
        animationFrame = requestAnimationFrame(scanBarcode);
        return;
      }
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        // Since true barcode detection requires a library,
        // we're simulating a successful scan after a random delay
        // In a real app, you'd use a barcode detection library
        if (Math.random() < 0.01) { // Small chance to detect a barcode on each frame
          // Generate a random barcode for demo purposes
          const simulatedBarcode = Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0');
          setScannedBarcode(simulatedBarcode);
          setScanning(false);
          
          // Simulate product lookup
          await fetchProductInfo(simulatedBarcode);
        }
      } catch (error) {
        console.error('Error during barcode scanning:', error);
      }
      
      // Continue scanning if no barcode found
      if (scanning) {
        animationFrame = requestAnimationFrame(scanBarcode);
      }
    };
    
    if (cameraPermission === 'granted') {
      animationFrame = requestAnimationFrame(scanBarcode);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [scanning, cameraPermission, showNotification]);
  
  // Fetch product information using the barcode
  const fetchProductInfo = async (barcode: string) => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock product data based on barcode
      const mockProducts = [
        { name: 'Organic Milk', category: 'Dairy', quantity: 1, unit: 'gallon', expiry_date: '2023-12-15' },
        { name: 'Chicken Breast', category: 'Meat', quantity: 1, unit: 'lb', expiry_date: '2023-12-10' },
        { name: 'Spinach', category: 'Produce', quantity: 1, unit: 'bunch', expiry_date: '2023-12-07' },
        { name: 'Wheat Bread', category: 'Bakery', quantity: 1, unit: 'loaf', expiry_date: '2023-12-12' },
        { name: 'Pasta', category: 'Pantry', quantity: 1, unit: 'box', expiry_date: '2024-06-15' }
      ];
      
      // Select a random product from the mock data
      const productInfo = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      
      // Pass the barcode and product info to the parent component
      onScan(barcode, productInfo);
    } catch (error) {
      console.error('Error fetching product information:', error);
      showNotification('Barcode scanned, but product info not found', 'info');
      onScan(barcode);
    } finally {
      setLoading(false);
    }
  };
  
  const handleManualEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const barcode = formData.get('barcode') as string;
    
    if (barcode && barcode.trim()) {
      setScannedBarcode(barcode);
      fetchProductInfo(barcode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Scan Product Barcode</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {cameraPermission === 'pending' && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <span className="ml-2">Requesting camera access...</span>
            </div>
          )}
          
          {cameraPermission === 'denied' && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-4">Camera access is required to scan barcodes.</p>
              <p className="text-gray-500 text-sm mb-4">Please check your browser settings and give camera permission to this site.</p>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Or enter barcode manually:</h3>
                <form onSubmit={handleManualEntry} className="flex">
                  <input
                    type="text"
                    name="barcode"
                    placeholder="Enter barcode number"
                    className="input flex-1 mr-2"
                    required
                  />
                  <button type="submit" className="btn btn-primary">Submit</button>
                </form>
              </div>
            </div>
          )}
          
          {cameraPermission === 'granted' && (
            <div>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg overflow-hidden"
                  style={{ maxHeight: '60vh', objectFit: 'cover' }}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden" // Hide canvas, just used for processing
                />
                
                {/* Scanning overlay */}
                {scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-2/3 h-32 border-2 border-indigo-500 rounded"></div>
                    <p className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-full mt-4">
                      Center the barcode in the box
                    </p>
                  </div>
                )}
                
                {/* Loading overlay */}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded-lg flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
                      <span>Looking up product...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {scannedBarcode && !loading && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-medium">Barcode scanned successfully!</p>
                  <p className="text-gray-600">{scannedBarcode}</p>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Or enter barcode manually:</h3>
                <form onSubmit={handleManualEntry} className="flex">
                  <input
                    type="text"
                    name="barcode"
                    placeholder="Enter barcode number"
                    className="input flex-1 mr-2"
                    required
                  />
                  <button type="submit" className="btn btn-primary">Submit</button>
                </form>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 