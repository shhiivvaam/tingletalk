'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface GifPickerProps {
    onSelect: (url: string) => void;
    onClose: () => void;
}

// Mock GIFs for demo "Best of Best" UI feel without API Key
const MOCK_GIFS = [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNzZ2Z3ZnN5eGx5eGx5eGx5eGx5eGx5eGx5eGx5eGw/3o7TKSjRrfIPjeiVyM/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNzZ2Z3ZnN5eGx5eGx5eGx5eGx5eGx5eGx5eGx5eGw/l0HlHJGHe3yAMhdQY/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNzZ2Z3ZnN5eGx5eGx5eGx5eGx5eGx5eGx5eGx5eGw/3o6Zt481isNVuQI1l6/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNzZ2Z3ZnN5eGx5eGx5eGx5eGx5eGx5eGx5eGx5eGw/26ufdipQqU2lhNA4g/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNzZ2Z3ZnN5eGx5eGx5eGx5eGx5eGx5eGx5eGx5eGw/l0HlO3BJ8LALPW4sE/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNzZ2Z3ZnN5eGx5eGx5eGx5eGx5eGx5eGx5eGx5eGw/3o6ozvv0zsJskzOCbu/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNzZ2Z3ZnN5eGx5eGx5eGx5eGx5eGx5eGx5eGx5eGw/xT5LMHxhOfscxPfIfm/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNzZ2Z3ZnN5eGx5eGx5eGx5eGx5eGx5eGx5eGx5eGw/3o7TKTn6rLs8n9m3de/giphy.gif",
];

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
    const [search, setSearch] = useState('');

    return (
        <div className="absolute bottom-full left-0 mb-4 z-50 w-80 bg-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-96">
            <div className="p-3 border-b border-white/5">
                <div className="relative bg-slate-800 rounded-lg">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search GIFs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2 custom-scrollbar">
                {MOCK_GIFS.map((url, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            onSelect(url);
                            onClose(); // Optional: close on select or keep open? Close is better usually.
                        }}
                        className="rounded-lg overflow-hidden hover:ring-2 ring-pink-500 transition-all aspect-video"
                    >
                        <img src={url} alt="GIF" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
            <div className="p-2 bg-slate-800 text-center text-[10px] text-slate-500">
                Powered by GIPHY (Demo)
            </div>
        </div>
    );
}
