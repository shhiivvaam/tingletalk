import { useState, useMemo } from 'react';
import { Search, Zap, ChevronDown, ChevronRight, MessageSquare, Clock, Users, Filter, Inbox } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';

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
    onFindMatch: () => void;
    isSearching: boolean;
}

type SectionType = 'inbox' | 'online' | 'history';

export default function OnlineUsersList({ users, currentUserId, onSelectUser, onFindMatch, isSearching }: OnlineUsersListProps) {
    const { unreadCounts, messages, knownUsers } = useChatStore();
    const { username, gender, country, state } = useUserStore();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<SectionType>('online');
    const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

    // --- Data Derivation ---

    // 1. Inbox: Users we have chatted with (active conversations)
    const inboxUsers = useMemo(() => {
        const userIds = Object.keys(messages);
        return userIds
            .filter(id => messages[id] && messages[id].length > 0)
            .map(id => knownUsers[id] || {
                id,
                nickname: 'Unknown',
                gender: 'other',
                country: 'VN',
                isOccupied: false
            })
            .filter(user => {
                const userMessages = messages[user.id] || [];
                return userMessages.some(m => m.senderId === user.id);
            });
    }, [messages, knownUsers]);

    // 2. Online: Filtered by Gender and Search
    const filteredOnlineUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (user.nickname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.country || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGender = genderFilter === 'all' || user.gender === genderFilter;
            return matchesSearch && matchesGender;
        });
    }, [users, searchTerm, genderFilter]);

    // 3. History: Closed chats or just duplicates of Inbox for now?
    const historyUsers = useMemo(() => {
        const onlineIds = new Set(users.map(u => u.id));
        const allKnownIds = Object.keys(messages);

        return allKnownIds
            .filter(id => !onlineIds.has(id) && messages[id]?.length > 0)
            .map(id => knownUsers[id] || {
                id,
                nickname: 'Offline User',
                gender: 'other',
                country: 'VN',
                isOccupied: false
            });
    }, [messages, knownUsers, users]);

    // Helpers
    const getInitials = (name: string | undefined | null) => (name || '?').charAt(0).toUpperCase();
    const getCountryCode = (country: string | undefined | null) => (country && typeof country === 'string') ? country.slice(0, 2).toUpperCase() : 'UN';

    const tabs: { id: SectionType; label: string; icon: any; count: number }[] = [
        { id: 'online', label: 'Online', icon: Users, count: filteredOnlineUsers.length },
        { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxUsers.length },
        { id: 'history', label: 'History', icon: Clock, count: historyUsers.length },
    ];

    // Component for a User Row
    const UserRow = ({ user, isOnline }: { user: OnlineUser | any, isOnline: boolean }) => (
        <button
            onClick={() => onSelectUser(user)}
            className="w-full p-2 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3 group text-left mb-1"
        >
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isOnline
                ? 'bg-gradient-to-br from-pink-500 text-white to-violet-600'
                : 'bg-slate-700 text-slate-400'
                }`}>
                {getInitials(user.nickname)}
                {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h3 className={`font-semibold truncate transition-colors ${isOnline ? 'text-slate-200 group-hover:text-pink-400' : 'text-slate-400'}`}>
                        {user.nickname || 'Unknown'}
                    </h3>
                    <div className="flex items-center gap-2">
                        {(unreadCounts[user.id] || 0) > 0 && (
                            <span className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                                {unreadCounts[user.id]}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="uppercase font-bold tracking-wider">{getCountryCode(user.country)}</span>
                        <span>•</span>
                        <span className="capitalize">{user.gender}</span>
                    </div>
                    {isOnline && user.isOccupied && <span className="text-amber-500">Busy</span>}
                </div>
            </div>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* My Profile Section */}
            <div className="p-5 border-b border-white/5 bg-slate-900/30 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
                        {getInitials(username)}
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-slate-900 rounded-full"></span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h2 className="font-bold text-slate-100 truncate text-lg">{username || 'You'}</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <span className="capitalize px-2 py-0.5 rounded-md bg-white/5 border border-white/5">{gender || 'Anonymous'}</span>
                            <span className="truncate">{state ? `${state}, ` : ''}{country || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Tab Navigation */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 relative ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/10 rounded-lg border border-white/5 shadow-sm"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5">
                                <tab.icon size={14} />
                                {tab.label}
                                {tab.count > 0 && <span className="text-[10px] opacity-70">({tab.count})</span>}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative px-2">

                {/* ONLINE TAB CONTENT */}
                <AnimatePresence mode="wait">
                    {activeTab === 'online' && (
                        <motion.div
                            key="online"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col h-full"
                        >
                            {/* Search & Match Controls */}
                            <div className="px-2 pb-4 space-y-3">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Find users..."
                                            className="w-full bg-slate-800/50 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500/50 border border-white/5 placeholder:text-slate-600"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex bg-slate-800/50 rounded-xl p-1 border border-white/5">
                                        {(['all', 'male', 'female'] as const).map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setGenderFilter(g)}
                                                className={`px-2.5 flex items-center justify-center rounded-lg transition-colors capitalize text-[10px] font-bold ${genderFilter === g ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                {g === 'all' ? 'All' : g.charAt(0).toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={onFindMatch}
                                    disabled={isSearching}
                                    className="w-full py-3 bg-gradient-to-r from-pink-600 to-violet-600 rounded-xl font-bold text-sm text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 border border-white/10"
                                >
                                    {isSearching ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={16} className="fill-white" />
                                            Random Quick Match
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* User List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 px-1">
                                {filteredOnlineUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 space-y-2">
                                        <Users size={32} className="opacity-20" />
                                        <p className="text-xs">No users found</p>
                                    </div>
                                ) : (
                                    filteredOnlineUsers.map(user => <UserRow key={`online-${user.id}`} user={user} isOnline={true} />)
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* INBOX TAB CONTENT */}
                    {activeTab === 'inbox' && (
                        <motion.div
                            key="inbox"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 overflow-y-auto custom-scrollbar px-1 py-2"
                        >
                            {inboxUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-500 space-y-2">
                                    <Inbox size={32} className="opacity-20" />
                                    <p className="text-xs">No active conversations</p>
                                </div>
                            ) : (
                                inboxUsers.map(user => <UserRow key={`inbox-${user.id}`} user={user} isOnline={users.some(u => u.id === user.id)} />)
                            )}
                        </motion.div>
                    )}

                    {/* HISTORY TAB CONTENT */}
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 overflow-y-auto custom-scrollbar px-1 py-2"
                        >
                            {historyUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-500 space-y-2">
                                    <Clock size={32} className="opacity-20" />
                                    <p className="text-xs">No recent history</p>
                                </div>
                            ) : (
                                historyUsers.map(user => <UserRow key={`history-${user.id}`} user={user} isOnline={false} />)
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
