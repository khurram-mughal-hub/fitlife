import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({
    label,
    error,
    className,
    containerClassName,
    ...props
}, ref) => {
    return (
        <div className={twMerge('w-full', containerClassName)}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={twMerge(
                    'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500 ml-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
