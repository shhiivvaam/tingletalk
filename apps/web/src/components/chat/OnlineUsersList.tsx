import { useState, useMemo } from 'react';
import { Search, Zap, ChevronDown, ChevronRight, MessageSquare, Clock, Users, Filter, Inbox, Globe, MapPin, Heart } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import RandomMatchModal from './RandomMatchModal';
import AdUnit from '../ads/AdUnit';

interface OnlineUser {
    id: string;
    nickname: string;
    gender: 'male' | 'female' | 'other';
    age?: number;
    country: string;
    state?: string;
    isOccupied: boolean;
}

interface OnlineUsersListProps {
    users: OnlineUser[];
    currentUserId: string | null;
    selectedUserId?: string | null;
    onSelectUser: (user: OnlineUser) => void;
    onFindMatch: (strategy?: 'optimal' | 'immediate') => void; // Updated signature
    isSearching: boolean;
}

type SectionType = 'inbox' | 'online' | 'history';

export default function OnlineUsersList({ users, currentUserId, selectedUserId, onSelectUser, onFindMatch, isSearching }: OnlineUsersListProps) {
    const { unreadCounts, messages, knownUsers } = useChatStore();
    const { username, gender, country, state } = useUserStore();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<SectionType>('online');
    const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
    const [locationFilter, setLocationFilter] = useState<'global' | 'nearest'>('nearest');
    const [showFilters, setShowFilters] = useState(false);
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false); // Modal state

    const handleStartMatch = (strategy: 'optimal' | 'immediate') => {
        setIsMatchModalOpen(false);
        onFindMatch(strategy);
    };

    // --- Data Derivation ---

    // 1. Inbox: Users we have chatted with (active conversations)
    const inboxUsers = useMemo(() => {
        const userIds = Object.keys(messages);
        return userIds
            .filter(id => messages[id] && messages[id].length > 0)
            .map(id => knownUsers[id] || {
                id,
                nickname: 'Anonymous', // Better than 'Unknown'
                gender: 'other',
                country: 'Unknown', // Setting to Unknown ensures it gets hidden by UI logic
                isOccupied: false
            })
            .filter(user => {
                const userMessages = messages[user.id] || [];
                return userMessages.some(m => m.senderId === user.id);
            })
            .sort((a, b) => {
                const msgsA = messages[a.id] || [];
                const msgsB = messages[b.id] || [];

                // Get latest timestamp (assuming messages are chronological, take last)
                const lastTimeA = msgsA.length > 0 ? msgsA[msgsA.length - 1].timestamp : 0;
                const lastTimeB = msgsB.length > 0 ? msgsB[msgsB.length - 1].timestamp : 0;

                return lastTimeB - lastTimeA;
            });
    }, [messages, knownUsers]);

    // 2. Online: Filtered by Gender and Search + Sorted by Location
    const filteredOnlineUsers = useMemo(() => {
        let result = users.filter(user => {
            const matchesSearch = (user.nickname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.country || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGender = genderFilter === 'all' || user.gender === genderFilter;
            return matchesSearch && matchesGender;
        });

        // Default Sort: Recency -> Nearest -> Standard
        result = result.sort((a, b) => {
            // Priority 0: Recent Message Activity (Global for all views effectively)
            const msgsA = messages[a.id] || [];
            const msgsB = messages[b.id] || [];
            const lastTimeA = msgsA.length > 0 ? msgsA[msgsA.length - 1].timestamp : 0;
            const lastTimeB = msgsB.length > 0 ? msgsB[msgsB.length - 1].timestamp : 0;

            if (lastTimeA !== lastTimeB) {
                return lastTimeB - lastTimeA; // Descending (Newest first)
            }

            if (locationFilter === 'nearest') {
                // Priority 1: State Match
                const aState = a.state || '';
                const bState = b.state || '';
                const myState = state || '';

                const aIsSameState = aState && myState && aState === myState;
                const bIsSameState = bState && myState && bState === myState;

                if (aIsSameState && !bIsSameState) return -1;
                if (!aIsSameState && bIsSameState) return 1;

                // Priority 2: Country Match
                const aCountry = a.country || '';
                const bCountry = b.country || '';
                const myCountry = country || '';

                const aIsSameCountry = aCountry === myCountry;
                const bIsSameCountry = bCountry === myCountry;

                if (aIsSameCountry && !bIsSameCountry) return -1;
                if (!aIsSameCountry && bIsSameCountry) return 1;
            }

            // Priority 3: Fallback stable sort
            return 0;
        });

        return result;
    }, [users, searchTerm, genderFilter, locationFilter, country, state, messages]);


    // 3. History: Closed chats or just duplicates of Inbox for now?
    const historyUsers = useMemo(() => {
        const onlineIds = new Set(users.map(u => u.id));
        const allKnownIds = Object.keys(messages);

        return allKnownIds
            .filter(id => !onlineIds.has(id) && messages[id]?.length > 0)
            .map(id => knownUsers[id] || {
                id,
                nickname: 'Anonymous', // User might be offline and not in knownUsers
                gender: 'other',
                country: 'Unknown', // Hide location if unknown
                isOccupied: false
            });
    }, [messages, knownUsers, users]);

    // Helpers
    const getInitials = (name: string | undefined | null) => (name || '?').charAt(0).toUpperCase();
    const getCountryCode = (country: string | undefined | null) => {
        if (!country || country === 'Unknown') return '';
        return (typeof country === 'string') ? country.slice(0, 2).toUpperCase() : '';
    };

    const getLocationString = (c: string | undefined | null, s: string | undefined | null) => {
        const cleanC = (!c || c === 'Unknown') ? undefined : c;
        const cleanS = (!s || s === 'Unknown') ? undefined : s;

        if (cleanS && cleanC) return `${cleanS}, ${getCountryCode(cleanC)}`;
        if (cleanC) return cleanC;
        return '';
    };

    const tabs: { id: SectionType; label: string; icon: any; count: number }[] = [
        { id: 'online', label: 'Online', icon: Users, count: filteredOnlineUsers.length },
        { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxUsers.length },
        { id: 'history', label: 'History', icon: Clock, count: historyUsers.length },
    ];

    const UserRow = ({
        user,
        isOnline,
        unreadCount,
        onSelectUser
    }: {
        user: OnlineUser | any,
        isOnline: boolean,
        unreadCount: number,
        onSelectUser: (user: OnlineUser) => void
    }) => {
        const isSelected = selectedUserId === user.id; // Check selection

        const getInitials = (name: string | undefined | null) => (name || '?').charAt(0).toUpperCase();
        const getCountryCode = (country: string | undefined | null) => {
            if (!country || country === 'Unknown') return '';
            return (typeof country === 'string') ? country.slice(0, 2).toUpperCase() : '';
        };

        const getLocationString = (c: string | undefined | null, s: string | undefined | null) => {
            const cleanC = (!c || c === 'Unknown') ? undefined : c;
            const cleanS = (!s || s === 'Unknown') ? undefined : s;

            if (cleanS && cleanC) return `${cleanS}, ${getCountryCode(cleanC)}`;
            if (cleanC) return cleanC;
            return '';
        };

        return (
            <button
                onClick={() => onSelectUser(user)}
                className={`w-full p-2 rounded-xl transition-all flex items-center gap-3 group text-left mb-1 relative overflow-hidden ${isSelected ? 'bg-pink-500/10 border border-pink-500/20' : 'hover:bg-white/5 border border-transparent'
                    }`}
            >
                {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 rounded-r-full" />
                )}

                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${isOnline
                    ? 'bg-gradient-to-br from-pink-500 text-white to-violet-600'
                    : 'bg-slate-700 text-slate-400'
                    }`}>
                    {getInitials(user.nickname)}
                    {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className={`font-semibold truncate transition-colors ${isSelected ? 'text-pink-200' : (isOnline ? 'text-slate-200 group-hover:text-pink-400' : 'text-slate-400')
                            }`}>
                            {user.nickname || 'Anonymous'}
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={`flex items-center justify-between text-xs transition-colors ${isSelected ? 'text-pink-300/70' : 'text-slate-500'}`}>
                        <div className="flex items-center gap-2 max-w-[140px]">
                            <span className="truncate" title={user.state ? `${user.state}, ${user.country}` : user.country}>
                                {getLocationString(user.country, user.state)}
                            </span>
                            {getLocationString(user.country, user.state) && <span className="opacity-50">•</span>}
                            <span className="capitalize shrink-0">{user.gender}</span>
                        </div>
                        {isOnline && user.isOccupied && <span className="text-amber-500 shrink-0">Busy</span>}
                    </div>
                </div>
            </button>
        );
    };

    const renderWithAds = (userList: any[], keyPrefix: string, mode: 'online' | 'offline' | 'check') => {
        const items: any[] = [];
        userList.forEach((user, index) => {
            const isOnline = mode === 'online' ? true :
                mode === 'offline' ? false :
                    users.some(u => u.id === user.id);

            items.push(
                <UserRow
                    key={`${keyPrefix}-${user.id}`}
                    user={user}
                    isOnline={isOnline}
                    unreadCount={unreadCounts[user.id] || 0}
                    onSelectUser={onSelectUser}
                />
            );

            // Insert Ad every 5 users
            if ((index + 1) % 5 === 0) {
                items.push(
                    <div key={`${keyPrefix}-ad-${index}`} className="py-2 px-1">
                        <AdUnit
                            // Default slot (Native Banner)
                            format="horizontal"
                            label="Sidebar List Ad"
                            style={{ minHeight: '80px' }}
                        />
                    </div>
                );
            }
        });

        if (items.length === 0) return null;

        return <>{items}</>;
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Content Area */}
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
                            <span className="relative z-10 flex items-center gap-2">
                                <tab.icon size={14} />
                                {tab.label}
                                {tab.count > 0 && (
                                    tab.id === 'inbox' ? (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold leading-none ${activeTab === tab.id
                                            ? 'bg-white text-pink-600 shadow-sm'
                                            : 'bg-white/10 text-slate-300'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    ) : (
                                        <span className={`w-2 h-2 rounded-full shadow-sm ${tab.id === 'online'
                                            ? 'bg-green-500 shadow-green-500/50'
                                            : 'bg-pink-500 shadow-pink-500/50'
                                            }`} />
                                    )
                                )}
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
                                {/* Random Match - Primary Action */}
                                <button
                                    onClick={() => setIsMatchModalOpen(true)}
                                    disabled={isSearching}
                                    className="w-full py-3 bg-gradient-to-r from-pink-600 to-violet-600 rounded-xl font-bold text-sm text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 border border-white/10 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    {isSearching ? (
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                            >
                                                <Heart size={16} fill="white" className="text-white" />
                                            </motion.div>
                                            <span className="animate-pulse">Scanning...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Zap size={16} className="fill-white animate-pulse" />
                                            Start Random Match
                                        </>
                                    )}
                                </button>

                                <div className="h-px bg-white/5 w-full my-2" />

                                {/* List Filters */}
                                <div className="flex flex-col gap-2">
                                    {/* Search & Option Toggle */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search users..."
                                                className="w-full bg-slate-800/50 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500/50 border border-white/5 placeholder:text-slate-600 h-9"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${showFilters
                                                ? 'bg-slate-700 text-white border-slate-600'
                                                : 'bg-slate-800/50 text-slate-500 border-white/5 hover:bg-slate-800 hover:text-slate-400'
                                                }`}
                                        >
                                            <Filter size={14} />
                                        </button>
                                    </div>

                                    {/* Collapsible Filters */}
                                    <AnimatePresence>
                                        {showFilters && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex flex-col gap-3 py-1">
                                                    {/* Gender Segmented Control */}
                                                    <div className="flex p-0.5 bg-slate-950/30 rounded-lg border border-white/5 relative">
                                                        {(['all', 'male', 'female'] as const).map((g) => {
                                                            const isActive = genderFilter === g;
                                                            return (
                                                                <button
                                                                    key={g}
                                                                    onClick={() => setGenderFilter(g)}
                                                                    className={`flex-1 relative py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors z-10 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                                                                >
                                                                    {isActive && (
                                                                        <motion.div
                                                                            layoutId="genderFilter"
                                                                            className="absolute inset-0 bg-slate-700/80 rounded-md shadow-sm border border-white/10"
                                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                                        />
                                                                    )}
                                                                    <span className="relative z-10">{g}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Location Toggles */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setLocationFilter('global')}
                                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-all ${locationFilter === 'global'
                                                                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]'
                                                                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-white/5'
                                                                }`}
                                                        >
                                                            <Globe size={12} />
                                                            Global
                                                        </button>
                                                        <button
                                                            onClick={() => setLocationFilter('nearest')}
                                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-all ${locationFilter === 'nearest'
                                                                ? 'bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.15)]'
                                                                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-white/5'
                                                                }`}
                                                        >
                                                            <MapPin size={12} />
                                                            Nearby
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* List Header */}
                            <div className="px-3 pb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                <span>Online Users</span>
                                <span className="bg-slate-800/50 px-2 py-0.5 rounded text-slate-400">{filteredOnlineUsers.length}</span>
                            </div>

                            {/* User List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 px-1">
                                {filteredOnlineUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 space-y-2">
                                        <Users size={32} className="opacity-20" />
                                        <p className="text-xs">No users found</p>
                                    </div>
                                ) : (
                                    renderWithAds(filteredOnlineUsers, 'online', 'online')
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
                                renderWithAds(inboxUsers, 'inbox', 'check')
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
                            className="flex-1 flex flex-col h-full"
                        >
                            {/* List Header */}
                            <div className="px-3 pt-2 pb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                <span>Recent History</span>
                                <span className="bg-slate-800/50 px-2 py-0.5 rounded text-slate-400">{historyUsers.length}</span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 px-1">
                                {historyUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 space-y-2">
                                        <Clock size={32} className="opacity-20" />
                                        <p className="text-xs">No recent history</p>
                                    </div>
                                ) : (
                                    renderWithAds(historyUsers, 'history', 'offline')
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <RandomMatchModal
                isOpen={isMatchModalOpen}
                onClose={() => setIsMatchModalOpen(false)}
                onSelectStrategy={handleStartMatch}
            />
        </div >
    );
}
