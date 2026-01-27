import { Zap } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
            <div className="relative">
                <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Ring 1 */}
                    <div className="absolute inset-0 border-t-4 border-l-4 border-transparent border-t-pink-500 border-l-violet-600 rounded-full animate-spin" />
                    {/* Ring 2 */}
                    <div className="absolute inset-2 border-r-4 border-b-4 border-transparent border-r-cyan-500 border-b-blue-600 rounded-full animate-spin [animation-direction:reverse]" />

                    <Zap className="text-white animate-pulse" size={32} fill="currentColor" />
                </div>
            </div>
            <div className="mt-8 text-center space-y-2">
                <h2 className="text-xl font-bold tracking-widest uppercase">Initializing</h2>
                <div className="flex gap-1 justify-center">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}
