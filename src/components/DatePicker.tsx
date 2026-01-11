'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    min?: string;
}

export default function DatePicker({ label, value, onChange, min }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse initial date or default to today
    const initialDate = value ? new Date(value) : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate);

    // Helper to get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return days;
    };

    // Helper to get first day of month (0-6)
    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        // Format YYYY-MM-DD manually to avoid timezone issues
        const y = newDate.getFullYear();
        const m = String(newDate.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');

        onChange(`${y}-${m}-${d}`);
        setIsOpen(false);
    };

    const formatDateLabel = (dateString: string) => {
        if (!dateString) return 'Select Date';
        const [y, m, d] = dateString.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    // Min date check logic
    const isDateDisabled = (day: number) => {
        if (!min) return false;
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const [minY, minM, minD] = min.split('-').map(Number);
        const minDate = new Date(minY, minM - 1, minD);

        // Set both to midnight for comparison
        checkDate.setHours(0, 0, 0, 0);
        minDate.setHours(0, 0, 0, 0);

        return checkDate < minDate;
    };

    // Calendar render logic
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Check equality avoiding timezones for selection styles
    const isSelected = (day: number) => {
        const [selY, selM, selD] = value.split('-').map(Number);
        return selY === currentMonth.getFullYear() &&
            (selM - 1) === currentMonth.getMonth() &&
            selD === day;
    };

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

            <div className={styles.container} onClick={() => setIsOpen(true)}>
                <span className={styles.label}>{label}</span>
                <div className={styles.valueRow}>
                    <CalendarIcon size={16} style={{ color: '#60A5FA' }} />
                    <span>{formatDateLabel(value)}</span>
                </div>

                {isOpen && (
                    <div className={styles.calendarPopup} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.header}>
                            <button className={styles.navBtn} onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
                            <span className={styles.monthTitle}>
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button className={styles.navBtn} onClick={handleNextMonth}><ChevronRight size={16} /></button>
                        </div>

                        <div className={styles.grid}>
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className={styles.dayLabel}>{d}</div>
                            ))}

                            {blanks.map((_, i) => (
                                <div key={`blank-${i}`} />
                            ))}

                            {days.map(day => (
                                <button
                                    key={day}
                                    className={`${styles.dayBtn} ${isSelected(day) ? styles.daySelected : ''} ${isDateDisabled(day) ? styles.dayDisabled : ''}`}
                                    onClick={() => handleDateSelect(day)}
                                    disabled={isDateDisabled(day)}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
