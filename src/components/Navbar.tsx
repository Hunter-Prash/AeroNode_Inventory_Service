'use client';

import Link from 'next/link';
import { Plane, Menu } from 'lucide-react';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className={styles.navbar}>
      <div className="container">
        <div className={styles.navContent}>
          <div className={styles.navLinks}>
            <Link href="#" className={styles.navLink}>Flights</Link>
            <Link href="#" className={styles.navLink}>Hotels</Link>
            <Link href="#" className={styles.navLink}>Car Rental</Link>
            <Link href="#" className={styles.navLink}>Deals</Link>
          </div>

          <div className={styles.authButtons}>
            {user ? (
              <>
                <span style={{ marginRight: '1rem', fontWeight: 500, color: 'var(--foreground)' }}>
                  Hi, {user.name || 'Traveler'}
                </span>
                <button className={styles.signInBtn} onClick={logout}>Sign Out</button>
              </>
            ) : (
              <>
                <button className={styles.signInBtn} onClick={() => router.push('/login')}>Sign In</button>
                <button className={styles.joinBtn} onClick={() => router.push('/register')}>Join Club</button>
              </>
            )}
          </div>

          <button className={styles.mobileMenuBtn} onClick={() => alert('Mobile menu clicked')}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}
