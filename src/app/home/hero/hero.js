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
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [bookingStatus, setBookingStatus] = useState({ loading: false, success: false, error: '' });

  // Fetch doctors and services on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [docsRes, srvsRes] = await Promise.all([
          apiService.getPublicDoctors(),
          apiService.getPublicServices()
        ]);
        
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setDoctors(Array.isArray(docsData) ? docsData : (docsData.doctors || docsData.data || []));
        }
        
        if (srvsRes.ok) {
          const srvsData = await srvsRes.json();
          setServices(Array.isArray(srvsData) ? srvsData : (srvsData.services || srvsData.data || []));
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch slots when doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setSlots([]);
        setSelectedSlot('');
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
        setSelectedSlot('');
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleBookAppointment = async () => {
    if (!patientName || !patientPhone || !selectedDoctor || !selectedService || !selectedDate || !selectedSlot) {
      setBookingStatus({ loading: false, success: false, error: 'Please fill all required fields.' });
      return;
    }

    setBookingStatus({ loading: true, success: false, error: '' });

    // Backend expects H:i format (e.g. "09:00"), but slot.start_time often includes seconds (e.g. "09:00:00")
    const formattedTime = selectedSlot.length > 5 ? selectedSlot.substring(0, 5) : selectedSlot;

    try {
      const res = await apiService.bookAppointment({
        doctor_id: parseInt(selectedDoctor),
        patient_name: patientName,
        patient_phone: patientPhone,
        appointment_date: selectedDate,
        appointment_time: formattedTime,
        start_time: formattedTime, // Added because backend validation requires this exact field
        service_id: parseInt(selectedService),
        patient_email: patientName.toLowerCase().replace(/\s+/g, '') + '@example.com', // placeholder if not provided
        notes: "Booked from website quick form",
      });

      const data = await res.json();
      if (res.ok) {
        setBookingStatus({ loading: false, success: true, error: '' });
        // Reset form
        setPatientName('');
        setPatientPhone('');
        setSelectedDoctor('');
        setSelectedService('');
        setSelectedDate('');
        setSelectedSlot('');
        setSlots([]);
        setTimeout(() => setBookingStatus(prev => ({ ...prev, success: false })), 5000);
      } else {
        setBookingStatus({ loading: false, success: false, error: data.message || 'Failed to book appointment.' });
      }
    } catch (err) {
      setBookingStatus({ loading: false, success: false, error: 'Network error. Please try again later.' });
    }
  };

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
              <input 
                type="text" 
                placeholder="Full Name" 
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>PHONE</label>
              <input 
                type="tel" 
                placeholder="+91 00000 00000" 
                value={patientPhone}
                onChange={e => setPatientPhone(e.target.value)}
              />
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
              <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                <option value="">Select Service</option>
                {services.map(srv => (
                  <option key={srv.id} value={srv.id}>{srv.name}</option>
                ))}
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
              <select 
                value={selectedSlot}
                onChange={e => setSelectedSlot(e.target.value)}
                disabled={!selectedDoctor || !selectedDate || loadingSlots || slots.length === 0}
              >
                {!selectedDoctor || !selectedDate ? (
                  <option value="">Select doctor & date first</option>
                ) : loadingSlots ? (
                  <option value="">Loading slots...</option>
                ) : slots.length === 0 ? (
                  <option value="">No slots available</option>
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

            <button 
              className={styles.submitBookingBtn} 
              onClick={handleBookAppointment}
              disabled={bookingStatus.loading}
            >
              {bookingStatus.loading ? 'Booking...' : 'Book Now'}
            </button>
          </div>

          {/* Feedback Messages */}
          {bookingStatus.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
              {bookingStatus.error}
            </div>
          )}
          {bookingStatus.success && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-xl font-medium">
              Appointment booked successfully! We will contact you shortly.
            </div>
          )}
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