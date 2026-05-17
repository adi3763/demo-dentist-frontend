"use client";
import React from 'react';
import styles from './footer.module.css';
import { FaFacebookF, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import { useContactModal } from '@/context/ContactModalContext';

const Footer = () => {
  const { openContactForm } = useContactModal();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* --- New CTA Section Start --- */}
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <h2>Ready to experience a different kind of dentistry?</h2>
            <p>Join thousands of patients who have found their sanctuary for oral health.</p>
            <button className={styles.ctaButton} onClick={openContactForm}>Book Your Consultation</button>
          </div>
        </div>
        {/* --- New CTA Section End --- */}

        <div className={styles.grid}>
          {/* ... aapka baaki ka Column code same rahega ... */}
          <div className={styles.brandCol}>
            <h2 className={styles.brandName}>Dr. Priya Sharma</h2>
            <p className={styles.brandDesc}>
              Noida&apos;s premier dental clinic providing aesthetic and clinical excellence since 2008. Your comfort is our priority.
            </p>
            <div className={styles.socialLinks}>
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaYoutube /></a>
            </div>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Quick Links</h3>
            <ul>
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Gallery</a></li>
              <li><a href="#">Testimonials</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Services</h3>
            <ul>
              <li><a href="#">Teeth Whitening</a></li>
              <li><a href="#">Dental Implants</a></li>
              <li><a href="#">Smile Makeover</a></li>
              <li><a href="#">Orthodontics</a></li>
            </ul>
          </div>

          <div className={styles.contactCol}>
            <h3 className={styles.colTitle}>Contact</h3>
            <div className={styles.contactItem}><FaMapMarkerAlt className={styles.icon} /><span>Sector 50, Noida, UP</span></div>
            <div className={styles.contactItem}><FaPhoneAlt className={styles.icon} /><span>+91 98765 43210</span></div>
            <div className={styles.contactItem}><FaEnvelope className={styles.icon} /><span>care@drpriyasharma.com</span></div>
            <div className={styles.contactItem}><FaClock className={styles.icon} /><span>Mon - Sat: 10AM - 8PM</span></div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>© 2024 Dr. Priya Sharma. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;