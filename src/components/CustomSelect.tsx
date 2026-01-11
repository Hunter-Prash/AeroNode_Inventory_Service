'use client';

import { useState } from 'react';
import { LucideIcon, ChevronDown, Check } from 'lucide-react';
import styles from './CustomSelect.module.css';

interface Option {
    value: string | number;
    label: string;
}

interface CustomSelectProps {
    label: string;
    icon: LucideIcon;
    value: string | number;
    options: Option[];
    onChange: (value: string | number) => void;
    iconColor?: string;
}

export default function CustomSelect({ label, icon: Icon, value, options, onChange, iconColor = '#60A5FA' }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentLabel = options.find(o => o.value == value)?.label || value;

    const handleSelect = (val: string | number) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

            <div className={styles.container} onClick={() => setIsOpen(!isOpen)}>
                <span className={styles.label}>{label}</span>
                <div className={styles.valueRow}>
                    <Icon size={16} style={{ color: iconColor }} />
                    <span>{currentLabel}</span>
                    <ChevronDown
                        size={14}
                        style={{
                            opacity: 0.5,
                            marginLeft: 'auto',
                            transition: 'transform 0.2s',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                    />
                </div>

                {isOpen && (
                    <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                className={`${styles.dropdownItem} ${value === opt.value ? styles.selected : ''}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                                {value === opt.value && <Check size={14} className="ml-auto" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
