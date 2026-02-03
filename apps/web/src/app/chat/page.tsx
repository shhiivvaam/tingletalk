import { Metadata } from 'next';
import ChatClient from './ChatClient';

export const metadata: Metadata = {
    title: "Live Private Chat Lobby | Tingle Talk - Anonymous Dating",
    description: "Ready to meet someone new? Join the Tingle Talk lobby, see who's online, and start a 100% anonymous chat on the best private chatting site.",
    keywords: ["live chat", "anonymous dating", "private chatting site", "anonymous lobby", "chat rooms", "online matching", "stranger chat"],
};

export default function ChatPage() {
    return <ChatClient />;
}
