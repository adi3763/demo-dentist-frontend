"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './header.module.css';
import apiService from '@/services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [services, setServices] = useState([]);
  const phoneNumber = "+917024934163";

  useEffect(() => {
    if (isFormOpen) {
      const fetchServices = async () => {
        try {
          const response = await apiService.getPublicServices();
          if (response.ok) {
            const data = await response.json();
            // Handling both { services: [] } and [] formats
            setServices(Array.isArray(data) ? data : (data.services || []));
          }
        } catch (error) {
          console.error('Failed to fetch services:', error);
        }
      };
      fetchServices();
    }
  }, [isFormOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      const response = await apiService.submitContactForm(formData);
      const data = await response.json();

      if (response.ok) {
        setStatus({ loading: false, success: true, error: null });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        // Close modal after 2 seconds on success
        setTimeout(() => {
          setIsFormOpen(false);
          setStatus({ loading: false, success: false, error: null });
        }, 2000);
      } else {
        setStatus({ loading: false, success: false, error: data.message || 'Something went wrong' });
      }
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Failed to connect to server' });
    }
  };

  return (
    <div className={styles.headerContainer}>
      {/* 1. Red Banner */}
      <div className={styles.banner}>
        <span>DENTAL EMERGENCY? WE&apos;RE HERE TO HELP</span>
        <a href={`tel:${phoneNumber}`} className={styles.bannerButton}>Call Now</a>
      </div>

      {/* 2. Main Header */}
      <header className={styles.header}>
        <div className={styles.logo}>Dr. Priya Sharma</div>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navActive : ''}`}>
          <ul>
            <li><Link href="/" onClick={() => setIsMenuOpen(false)}>HOME</Link></li>
            <li><Link href="/about" onClick={() => setIsMenuOpen(false)}>ABOUT</Link></li>
            <li><Link href="/servicesNav" onClick={() => setIsMenuOpen(false)}>SERVICES</Link></li>
            <li><Link href="/blogpage" onClick={() => setIsMenuOpen(false)}>BLOGS</Link></li>
          </ul>
        </nav>

        {/* Contact Us Button - Modal trigger */}
        <button className={styles.bookButton} onClick={() => setIsFormOpen(true)}>
          Contact us
        </button>

        <button className={styles.menuIcon} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar1 : ''}`}></div>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar2 : ''}`}></div>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar3 : ''}`}></div>
        </button>
      </header>

      {/* 3. Popup Contact Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsFormOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsFormOpen(false)}>&times;</button>
            
            <h3>Enquire Now</h3>
            {status.success ? (
              <div className={styles.successMessage}>
                <p>Thank you for contacting us. We will get back to you soon.</p>
              </div>
            ) : (
              <form className={styles.contactForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name" 
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email" 
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number" 
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Subject</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="Inquiry about services">Inquiry about services</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.title || service.name}>
                        {service.title || service.name}
                      </option>
                    ))}
                    <option value="Emergency Care">Emergency Care</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Your Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4" 
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>

                {status.error && <p className={styles.errorMessage}>{status.error}</p>}

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={status.loading}
                >
                  {status.loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;