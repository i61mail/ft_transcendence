'use client'

import React from 'react';
import Header from '@/components/Header';
import useglobalStore from '@/store/globalStore';

interface GameCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    width?: number;
    height?: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
    canvasRef, 
    width = 1200, 
    height = 800 
}) => {
    const manager = useglobalStore();
    
    return (
        <>
            <style>{`
                body, html {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
            `}</style>
            <div className="min-h-screen w-screen bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5] relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob top-0 -left-20"></div>
                    <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 right-0"></div>
                    <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
                </div>

                {/* Header */}
                <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/10">
                    <Header user={manager.user} activeRoute="game" />
                </div>

                {/* Game Canvas Container */}
                <main className="relative z-10 h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
                    <div className="flex flex-col items-center gap-6">
                        {/* Canvas with Enhanced Styling */}
                        <canvas 
                            ref={canvasRef} 
                            width={width} 
                            height={height}
                            style={{
                                display: 'block',
                                border: '4px solid rgba(45, 90, 138, 0.3)',
                                borderRadius: '16px',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                backgroundColor: '#1a1a2e',
                                padding: '2px',
                                maxWidth: '100vw',
                                maxHeight: 'calc(100vh - 80px)',
                                objectFit: 'contain'
                            }}
                        >
                            If you see this message, then the canvas did not load properly
                        </canvas>
                        
                        {/* Game Status Indicator */}
                        <div className="flex items-center gap-3 text-white/80 absolute bottom-4">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-pixelify text-sm">Game Running...</span>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default GameCanvas;
