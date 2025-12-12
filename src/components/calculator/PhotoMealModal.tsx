'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Sparkles, Loader2 } from 'lucide-react';
import { estimateMacros } from '@/lib/food-knowledge';
import Image from 'next/image';

interface PhotoMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMealGenerated: (rows: any[]) => void;
}

export function PhotoMealModal({ isOpen, onClose, onMealGenerated }: PhotoMealModalProps) {
    const [step, setStep] = useState<'upload' | 'analysis' | 'confirm'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [blocks, setBlocks] = useState(3);
    const [analyzing, setAnalyzing] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate MIME type for Gemini
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
            if (!validTypes.includes(file.type)) {
                alert(`Unsupported image format (${file.type}). Please use JPEG, PNG, or WebP.`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setStep('confirm'); // Move to confirm step to select blocks, THEN click generate to Analyze
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirm = async () => {
        setAnalyzing(true);
        try {
            const res = await fetch('/api/vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: image, blocks: blocks })
            });

            const result = await res.json();

            if (!res.ok) {
                console.error(result.error, result.details);
                alert(`Error: ${result.details || result.error || 'Unknown error'}`);
                setAnalyzing(false);
                return;
            }

            const apiData = result.data;
            console.log("Vision API Data:", apiData);

            if (Array.isArray(apiData) && apiData.length > 0) {
                const newRows = apiData.map((item: any, index: number) => ({
                    id: index + 1,
                    foodName: item.foodName || "Unknown Item",
                    protein: Number(item.protein) || 0,
                    carbs: Number(item.carbs) || 0,
                    fat: Number(item.fat) || 0,
                    grams: Number(item.grams) || 100,
                    blocks: 0
                }));
                onMealGenerated(newRows);
                onClose();
                setStep('upload');
                setImage(null);
            } else {
                console.error("Invalid data format received:", apiData);
                alert("The AI couldn't identify any food in this image. Please try a clearer photo.");
            }

        } catch (e) {
            console.error(e);
            alert('Network error analyzing image. Check console for details.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-zone-blue-600" />
                        AI Photo Meal Builder
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {step === 'upload' && !analyzing && (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative group">
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp, image/heic"
                                className="hidden" // Completely hide it 
                                onChange={handleImageUpload}
                            />
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">Click to upload meal photo</p>
                            <p className="text-xs text-slate-500 mt-1">or drag and drop here</p>
                        </label>
                    )}

                    {(analyzing || (step === 'upload' && image)) && (
                        <div className="space-y-4 text-center">
                            {image && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                                    <Image src={image} alt="Uploaded meal" fill className="object-cover" />
                                    {analyzing && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                            <div className="bg-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
                                                <Loader2 className="w-5 h-5 animate-spin text-zone-blue-600" />
                                                <span className="font-semibold text-slate-700">Scanning ingredients...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'confirm' && !analyzing && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span>Image analyzed! Identified balanced ingredients.</span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">How many blocks is this?</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range" min="1" max="6" step="0.5"
                                        value={blocks}
                                        onChange={(e) => setBlocks(parseFloat(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-zone-blue-600"
                                    />
                                    <span className="font-black text-2xl text-zone-blue-600 w-12 text-center">{blocks}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">The AI will use this target to calculate portion sizes for the identified foods.</p>
                            </div>

                            <Button onClick={handleConfirm} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-lg shadow-lg shadow-primary/20">
                                <Sparkles className="w-5 h-5 mr-2" /> Generate Meal
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
