'use client';

import { MessageSquare, ShieldCheck, UserPlus, Globe } from 'lucide-react';
import AdUnit from '@/components/ads/AdUnit';
import { AD_CONFIG } from '@/constants/ads';

export default function LandingInfo() {
    return (
        <section id="how-it-works" className="w-full max-w-6xl mx-auto py-24 px-4 space-y-32">

            {/* How it Works */}
            <div className="space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white">How it Works</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Starting a conversation on Tingle Talk is faster than sending a text.
                        No passwords, no profile pictures, just instant connection.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <StepCard
                        icon={<UserPlus className="text-pink-500" size={32} />}
                        step="01"
                        title="Pick a Nickname"
                        description="Choose any name you like. Your identity remains 100% hidden."
                    />
                    <StepCard
                        icon={<Globe className="text-violet-500" size={32} />}
                        step="02"
                        title="Set Location"
                        description="Select your country and state to find matches in your area or globally."
                    />
                    <StepCard
                        icon={<MessageSquare className="text-cyan-500" size={32} />}
                        step="03"
                        title="Start Chatting"
                        description="Boom! You're in. Match with strangers instantly and safely."
                    />
                </div>
            </div>

            {/* FAQ Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white">Frequently Asked Questions</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Everything you need to know about the world's most secure anonymous chat platform.
                        Can't find what you're looking for? Reach out to our 24/7 support.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-300 text-sm">
                        <ShieldCheck size={16} className="text-green-500" />
                        <span>End-to-End Encrypted Conversations</span>
                    </div>

                    {/* Ad Grid in Left Column - 2x2 Responsive */}
                    {AD_CONFIG.ENABLE_ADS && (
                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <AdUnit
                                type="adsterra-native"
                                format="rectangle"
                                label="FAQ Ad 1"
                                delay={100}
                            />
                            <AdUnit
                                type="adsterra-native"
                                format="rectangle"
                                label="FAQ Ad 2"
                                delay={300}
                            />
                            <AdUnit
                                type="adsterra-native"
                                format="rectangle"
                                label="FAQ Ad 3"
                                delay={500}
                            />
                            <AdUnit
                                type="adsterra-native"
                                format="rectangle"
                                label="FAQ Ad 4"
                                delay={700}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <FAQItem
                        question="Is Tingle Talk really anonymous?"
                        answer="Yes. We don't store your IP address, your real name, or your personal data. Each session is unique and temporary."
                    />
                    <FAQItem
                        question="Do I need to create an account?"
                        answer="Never. Tingle Talk is built for speed. No sign-up, no email verification, and no passwords required."
                    />
                    <FAQItem
                        question="Is it safe to chat with strangers?"
                        answer="Safety is our priority. We use AI moderation to block malicious content, and you can report or block users instantly."
                    />
                    <FAQItem
                        question="Can I use Tingle Talk on my phone?"
                        answer="Absolutely! Tingle Talk is a Progressive Web App (PWA). You can install it on iOS or Android directly from the browser."
                    />
                </div>
            </div>
        </section>
    );
}

function StepCard({ icon, step, title, description }: { icon: any, step: string, title: string, description: string }) {
    return (
        <div className="glass-panel p-8 rounded-[2rem] relative group hover:bg-white/[0.05] transition-all duration-500">
            <div className="text-sm font-black text-white/20 mb-6 group-hover:text-pink-500/40 transition-colors uppercase tracking-[0.2em]">Step {step}</div>
            <div className="mb-6">{icon}</div>
            <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
            <p className="text-slate-400 leading-relaxed font-light">{description}</p>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-lg font-bold text-white mb-2">{question}</h4>
            <p className="text-slate-400 font-light leading-relaxed">{answer}</p>
        </div>
    );
}
