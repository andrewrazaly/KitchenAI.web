'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  X, 
  Mic, 
  MicOff,
  Camera, 
  Upload,
  FileImage,
  Loader2,
  Check,
  Edit3,
  Trash2,
  Plus,
  Volume2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  purchaseDate: string;
  location: string;
  status: 'fresh' | 'expiring' | 'expired';
  image?: string;
}

interface ParsedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  confidence: number;
  category?: string;
  expiryDate?: string;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Omit<InventoryItem, 'id' | 'status'>[]) => void;
}

export default function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [currentStep, setCurrentStep] = useState<'method' | 'voice' | 'receipt' | 'preview'>('method');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const categories = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry', 'Frozen', 'Other'];
  const locations = ['Refrigerator', 'Freezer', 'Pantry', 'Counter', 'Cabinet'];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const parseVoiceInput = async (text: string): Promise<ParsedItem[]> => {
    // Simulate AI parsing - in real app, this would call an AI service
    const items: ParsedItem[] = [];
    
    // Simple regex patterns for parsing
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?|items?)\s+(?:of\s+)?([a-zA-Z\s]+)/gi,
      /([a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?|items?)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const quantity = parseFloat(match[1] || match[2]);
        const unit = (match[2] || match[3]).toLowerCase();
        const name = (match[3] || match[1]).trim();

        if (quantity && unit && name) {
          // Normalize unit
          let normalizedUnit = 'g';
          if (unit.includes('kg') || unit.includes('kilogram')) normalizedUnit = 'kg';
          else if (unit.includes('item')) normalizedUnit = 'item';

          items.push({
            id: Math.random().toString(36).substr(2, 9),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            quantity,
            unit: normalizedUnit,
            confidence: 0.85,
            category: 'Other'
          });
        }
      }
    });

    return items;
  };

  const parseReceiptImage = async (file: File): Promise<ParsedItem[]> => {
    // Simulate OCR + AI parsing - in real app, this would use OCR service + AI
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock parsed receipt data
        const mockItems: ParsedItem[] = [
          { id: '1', name: 'Organic Chicken Breast', quantity: 500, unit: 'g', confidence: 0.92, category: 'Meat' },
          { id: '2', name: 'Fresh Tomatoes', quantity: 300, unit: 'g', confidence: 0.88, category: 'Produce' },
          { id: '3', name: 'Whole Milk', quantity: 1, unit: 'item', confidence: 0.95, category: 'Dairy' },
          { id: '4', name: 'Brown Rice', quantity: 2, unit: 'kg', confidence: 0.90, category: 'Pantry' },
          { id: '5', name: 'Greek Yogurt', quantity: 500, unit: 'g', confidence: 0.87, category: 'Dairy' }
        ];
        resolve(mockItems);
      }, 2000);
    });
  };

  const handleVoiceProcess = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    try {
      const items = await parseVoiceInput(transcript);
      setParsedItems(items);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error parsing voice input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCurrentStep('receipt');
    }
  };

  const handleReceiptProcess = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      const items = await parseReceiptImage(selectedFile);
      setParsedItems(items);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error parsing receipt:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateParsedItem = (id: string, updates: Partial<ParsedItem>) => {
    setParsedItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeParsedItem = (id: string) => {
    setParsedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFinalImport = () => {
    const itemsToImport = parsedItems.map(item => ({
      name: item.name,
      category: item.category || 'Other',
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate || '',
      purchaseDate: new Date().toISOString().split('T')[0],
      location: 'Pantry',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=60&h=60&fit=crop&crop=center'
    }));

    onImport(itemsToImport);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep('method');
    setIsRecording(false);
    setIsProcessing(false);
    setTranscript('');
    setParsedItems([]);
    setSelectedFile(null);
    setPreviewUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Bulk Import Items</h2>
              <p className="text-sm text-gray-500 mt-1">Add multiple items quickly using voice or receipt upload</p>
            </div>
            <Button 
              onClick={handleClose} 
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Method Selection */}
          {currentStep === 'method' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 text-center">Choose Import Method</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Voice Import */}
                <div 
                  onClick={() => setCurrentStep('voice')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors">
                      <Mic className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">Voice Import</h4>
                      <p className="text-gray-600 mt-2">Speak your grocery list and we'll parse it automatically</p>
                      <p className="text-sm text-gray-500 mt-2">Example: "500 grams chicken, 2 kg rice, 300 grams tomatoes"</p>
                    </div>
                  </div>
                </div>

                {/* Receipt Upload */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                      <Camera className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">Receipt Upload</h4>
                      <p className="text-gray-600 mt-2">Upload a photo of your grocery receipt</p>
                      <p className="text-sm text-gray-500 mt-2">We'll extract items, quantities, and dates automatically</p>
                    </div>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Voice Recording */}
          {currentStep === 'voice' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Voice Import</h3>
                <p className="text-gray-600">Speak your grocery list clearly. Include quantities and units.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-center">
                  <Button
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`w-24 h-24 rounded-full ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                  </p>
                </div>

                {transcript && (
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-800 mb-2">Transcript:</h4>
                    <p className="text-gray-700">{transcript}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep('method')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVoiceProcess}
                  disabled={!transcript.trim() || isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Voice Input'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Receipt Processing */}
          {currentStep === 'receipt' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Receipt Processing</h3>
                <p className="text-gray-600">We'll extract items from your receipt image</p>
              </div>

              {previewUrl && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="max-w-md mx-auto">
                    <img 
                      src={previewUrl} 
                      alt="Receipt preview" 
                      className="w-full rounded-lg border shadow-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep('method')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleReceiptProcess}
                  disabled={!selectedFile || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Receipt...
                    </>
                  ) : (
                    'Process Receipt'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Preview & Edit */}
          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Review & Edit Items</h3>
                <p className="text-gray-600">Verify the parsed items and make any necessary adjustments</p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {parsedItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="md:col-span-2">
                        <Input
                          value={item.name}
                          onChange={(e) => updateParsedItem(item.id, { name: e.target.value })}
                          className="font-medium"
                          placeholder="Item name"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateParsedItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                          className="w-20 text-center"
                          min="1"
                        />
                        <select
                          value={item.unit}
                          onChange={(e) => updateParsedItem(item.id, { unit: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="item">item</option>
                        </select>
                      </div>

                      <select
                        value={item.category || 'Other'}
                        onChange={(e) => updateParsedItem(item.id, { category: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            item.confidence > 0.9 ? 'bg-green-500' : 
                            item.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-500">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                        <Button
                          onClick={() => removeParsedItem(item.id)}
                          className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {parsedItems.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No items were detected. Please try again.</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep('method')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Start Over
                </Button>
                <Button
                  onClick={handleFinalImport}
                  disabled={parsedItems.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Import {parsedItems.length} Items
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 