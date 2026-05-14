'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './hero.module.css';
import { FaWhatsapp } from 'react-icons/fa'; 
import apiService from '@/services/api';

const Hero = () => {
  // WhatsApp Configuration
  const phoneNumber = "917024934163"; 
  const message = "Hello Dr. Priya Sharma, I would like to inquire about dental services.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Booking Form State
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiService.getPublicDoctors();
        const data = await res.json();
        if (res.ok) {
          const docs = Array.isArray(data) ? data : (data.doctors || data.data || []);
          setDoctors(docs);
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch slots when doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await apiService.getDoctorSlots(selectedDoctor, selectedDate);
        const data = await res.json();
        if (res.ok) {
          setSlots(data.slots || []);
        } else {
          setSlots([]);
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  return (
    <div className={styles.heroWrapper}>
      
      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <div className={styles.textContainer}>
          <div className={styles.ratedBadge}>NOIDA&apos;S TOP RATED DENTAL CLINIC</div>
          <h1 className={styles.title}>
            Transform Your <span className={styles.smileUnderline}>Smile</span> With Expert Care
          </h1>
          <p className={styles.subtitle}>
            Experience world-class dental treatments in a sanctuary of luxury and precision. We blend advanced technology with personalized care to create lasting smiles.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryCta}>Contact Us</button>
            <button className={styles.secondaryCta}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.playIcon}>
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              Virtual Tour
            </button>
          </div>
        </div>

        {/* Hero Image Section - Modals Removed */}
        <div className={styles.imageModalsContainer}>
          <div className={styles.imageBgCircle}></div>
          <div className={styles.dentistImageContainer}>
            <Image 
                src="/images/Gemini_Generated_Image_y2iobky2iobky2io.png"
                alt="Dr. Priya Sharma, Expert Dentist"
                width={500} 
                height={500} 
                className={styles.dentistPhoto}
                priority 
            />
          </div>
        </div>
      </div>

      {/* Quick Booking Form Section */}
      <div className={styles.bookingBarContainer}>
        <div className={styles.bookingBar}>
          <div className={styles.bookingHeader}>
            <span className={styles.boltIcon}>⚡</span>
            <span>Book in 30 Seconds</span>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>NAME</label>
              <input type="text" placeholder="Full Name" />
            </div>
            
            <div className={styles.inputGroup}>
              <label>PHONE</label>
              <input type="tel" placeholder="+91 00000 00000" />
            </div>

            <div className={styles.inputGroup}>
              <label>DOCTOR</label>
              <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                <option value="">Select Doctor</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>SERVICE</label>
              <select>
                <option>General Checkup</option>
                <option>Root Canal</option>
                <option>Teeth Whitening</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>DATE</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>

            <div className={styles.inputGroup}>
              <label>TIME SLOT</label>
              <select disabled={!selectedDoctor || !selectedDate || loadingSlots || slots.length === 0}>
                {!selectedDoctor || !selectedDate ? (
                  <option>Select doctor & date first</option>
                ) : loadingSlots ? (
                  <option>Loading slots...</option>
                ) : slots.length === 0 ? (
                  <option>No slots available</option>
                ) : (
                  <>
                    <option value="">Select Time Slot</option>
                    {slots.map(slot => (
                      <option 
                        key={slot.start_time} 
                        value={slot.start_time} 
                        disabled={!slot.available}
                      >
                        {slot.label || `${slot.start_time} - ${slot.end_time}`} {!slot.available && '(Booked)'}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <button className={styles.submitBookingBtn}>
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Icon */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.floatingWhatsApp}
      >
        <FaWhatsapp size={35} />
      </a>
    </div>
  );
};

export default Hero;