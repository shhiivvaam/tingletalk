import { Metadata } from 'next';
import ChatClient from './ChatClient';

export const metadata: Metadata = {
    title: "Chat Lobby | Tingle Talk - Live Anonymous Chat",
    description: "Ready to meet someone new? Join the Tingle Talk lobby, see who's online, and start a 100% anonymous chat instantly.",
    keywords: ["live chat", "anonymous lobby", "chat rooms", "online matching", "stranger chat"],
};

export default function ChatPage() {
    return <ChatClient />;
}
