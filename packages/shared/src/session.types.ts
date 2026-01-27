export interface AnonymousSession {
    id: string; // socketId
    tempId: string; // generated uuid for the session
    nickname: string;
    gender: 'male' | 'female' | 'other';
    country?: string;
    state?: string;
    interests?: string[];
    createdAt: number;
}
