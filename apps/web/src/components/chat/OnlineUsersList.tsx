import { useState } from 'react';
import { Search, User } from 'lucide-react';

interface OnlineUser {
    id: string;
    nickname: string;
    gender: 'male' | 'female' | 'other';
    country: string;
    isOccupied: boolean;
}

interface OnlineUsersListProps {
    users: OnlineUser[];
    currentUserId: string | null;
    onSelectUser: (user: OnlineUser) => void;
}

export default function OnlineUsersList({ users, currentUserId, onSelectUser }: OnlineUsersListProps) {
    const [filter, setFilter] = useState('');

    const filteredUsers = users.filter(user =>
        String(user.nickname || '').toLowerCase().includes(filter.toLowerCase()) ||
        String(user.country || '').toLowerCase().includes(filter.toLowerCase())
    );

    const getInitials = (name: string | undefined | null) => {
        return (name || '?').charAt(0).toUpperCase();
    };

    const getCountryCode = (country: string | undefined | null) => {
        if (typeof country !== 'string' || !country) return 'UN';
        return country.slice(0, 2).toUpperCase();
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md border-r border-white/5 w-80">
            <div className="p-4 border-b border-white/5 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Online People ({users?.length || 0})
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-slate-800/50 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {filteredUsers.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 text-sm">
                        No users found.
                    </div>
                ) : (
                    filteredUsers.map(user => {
                        if (!user) return null;
                        return (
                            <button
                                key={user.id}
                                onClick={() => onSelectUser(user)}
                                className="w-full p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3 group text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 text-white to-violet-600 flex items-center justify-center font-bold text-sm">
                                    {getInitials(user.nickname)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-200 truncate group-hover:text-pink-400 transition-colors">
                                            {user.nickname || 'Anonymous'}
                                        </h3>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                            {getCountryCode(user.country)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="capitalize">{user.gender || 'Unknown'}</span>
                                        {user.isOccupied && (
                                            <span className="text-amber-500 flex items-center gap-1">
                                                Busy
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
