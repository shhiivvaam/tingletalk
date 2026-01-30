'use client';

import { motion } from 'framer-motion';
import { Heart, Zap, Shield, Ghost } from 'lucide-react';

export default function AnimatedFeatures() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0"
        >
            <FeatureBox icon={<Ghost size={20} />} title="100% Anonymous" desc="No Real Identity" />
            <FeatureBox icon={<Heart size={20} />} title="Smart Match" desc="Find Dates Fast" />
            <FeatureBox icon={<Zap size={20} />} title="Instant Chat" desc="No Waiting" />
            <FeatureBox icon={<Shield size={20} />} title="Safe & Secure" desc="End-to-End Encrypted" />
        </motion.div>
    );
}

function FeatureBox({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm flex flex-col gap-2 hover:bg-white/10 transition-colors cursor-default">
            <div className="text-pink-500 mb-1">{icon}</div>
            <div>
                <h4 className="font-bold text-slate-200">{title}</h4>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
        </div>
    );
}
