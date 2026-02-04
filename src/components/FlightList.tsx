'use client';

import { useEffect, useState } from 'react';

import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import styles from './FlightList.module.css';
import FlightCard from './FlightCard';


export default function FlightList() {
    const [flights, setFlights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://localhost:3000/flights')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch flights');
                return res.json();
            })
            .then(data => {
                setFlights(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load flights. Please try again.');
                setLoading(false);
            });
    }, []);

    return (
        <aside className={styles.sidebar}>
            <div className={styles.titleArea}>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>Explore Flights</h1>
                    <span className={styles.resultsCount}>142 results found</span>
                </div>

                <div className={styles.filterRow}>
                    <button className={`${styles.filterBtn} ${styles.active}`}>
                        <SlidersHorizontal size={14} /> Filters
                    </button>
                    <button className={styles.filterBtn}>
                        Best Price <span style={{ color: '#10B981' }}>$845</span>
                    </button>
                    <button className={styles.filterBtn}>
                        Quickest <span style={{ color: '#64748B' }}>14h 20m</span>
                    </button>
                    <button className={styles.filterBtn}>
                        Stops <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            <div className={styles.flightGrid}>
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading flights...</div>
                ) : error ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>
                ) : flights.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>No flights found</div>
                ) : (
                    flights.map(flight => (
                        <FlightCard key={flight.id} {...flight} />
                    ))
                )}
            </div>
        </aside>
    );
}
