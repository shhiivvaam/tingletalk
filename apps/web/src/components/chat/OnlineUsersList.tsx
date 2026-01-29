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
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSections, setExpandedSections] = useState<Record<SectionType, boolean>>({
        inbox: true,
        online: true,
        history: false
    });
    const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

    const toggleSection = (section: SectionType) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // --- Data Derivation ---

    // 1. Inbox: Users we have chatted with (active conversations)
    // "Users only from whom we have received messages" - strictly interpreted, or just active chats?
    // Let's do: Users with whom we have > 0 messages.
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
            }) // Fallback if missing
            .filter(user => {
                // Inbox Filter: received at least one message? Or just any chat?
                // User request: "users only from whom we have received messages"
                const userMessages = messages[user.id] || [];
                const hasReceived = userMessages.some(m => m.senderId === user.id);
                return hasReceived;
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
    // "History Section -> will contain the history of the chats that we had recently or our previous discussions."
    // Let's make History = Users we chatted with but are currently OFFLINE. (Since currently persistence is transient)
    // Or users in `knownUsers` who are NOT in `onlineUsers` but have messages.
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
            <div className="p-4 border-b border-white/5 bg-slate-800/20">
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                        {getInitials(username)}
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h2 className="font-bold text-slate-200 truncate">{username || 'You'}</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="capitalize">{gender || 'Anonymous'}</span>
                            <span>•</span>
                            <span className="truncate">{state ? `${state}, ` : ''}{country || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Match & Search Header */}
            <div className="p-4 border-b border-white/5 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-slate-800/50 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Match Button */}
                <button
                    onClick={onFindMatch}
                    disabled={isSearching}
                    className="w-full py-2 bg-gradient-to-r from-pink-500 to-violet-600 rounded-lg font-bold text-xs text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSearching ? (
                        <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Matching...
                        </>
                    ) : (
                        <>
                            <Zap size={14} />
                            Find Random Match
                        </>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {/* INBOX SECTION */}
                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('inbox')}
                        className="w-full flex items-center justify-between p-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Inbox size={14} />
                            <span>Inbox ({inboxUsers.length})</span>
                        </div>
                        {expandedSections.inbox ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <AnimatePresence>
                        {expandedSections.inbox && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                {inboxUsers.length === 0 ? (
                                    <div className="text-center text-slate-600 py-4 text-xs italic">
                                        No active chats
                                    </div>
                                ) : (
                                    inboxUsers.map(user => <UserRow key={`inbox-${user.id}`} user={user} isOnline={users.some(u => u.id === user.id)} />)
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-px bg-white/5 my-2 mx-2" />

                {/* ONLINE SECTION */}
                <div className="mb-2">
                    <div className="flex items-center justify-between p-2 pr-0">
                        <button
                            onClick={() => toggleSection('online')}
                            className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
                        >
                            <Users size={14} />
                            <span>Online ({filteredOnlineUsers.length})</span>
                        </button>

                        {/* Gender Filter Mini-Toggle */}
                        {expandedSections.online && (
                            <div className="flex bg-slate-800 rounded-lg p-0.5">
                                {(['all', 'male', 'female'] as const).map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setGenderFilter(g)}
                                        className={`px-2 py-0.5 text-[10px] rounded-md transition-colors capitalize ${genderFilter === g ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {expandedSections.online && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                {filteredOnlineUsers.length === 0 ? (
                                    <div className="text-center text-slate-600 py-4 text-xs italic">
                                        No users found
                                    </div>
                                ) : (
                                    filteredOnlineUsers.map(user => <UserRow key={`online-${user.id}`} user={user} isOnline={true} />)
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-px bg-white/5 my-2 mx-2" />

                {/* HISTORY SECTION */}
                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('history')}
                        className="w-full flex items-center justify-between p-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>History ({historyUsers.length})</span>
                        </div>
                        {expandedSections.history ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <AnimatePresence>
                        {expandedSections.history && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                {historyUsers.length === 0 ? (
                                    <div className="text-center text-slate-600 py-4 text-xs italic">
                                        No recent history
                                    </div>
                                ) : (
                                    historyUsers.map(user => <UserRow key={`history-${user.id}`} user={user} isOnline={false} />)
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
