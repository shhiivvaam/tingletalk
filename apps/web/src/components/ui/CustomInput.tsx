'use client';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    error?: string;
}

export default function CustomInput({ label, icon, error, className, ...props }: CustomInputProps) {
    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-pink-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 text-base text-slate-100
                        outline-none transition-all duration-300 placeholder:text-slate-600
                        focus:border-pink-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-pink-500/20
                        ${icon ? 'pl-12 pr-5' : 'px-5'}
                        ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-xs text-red-400 ml-1">{error}</span>
            )}
        </div>
    );
}
