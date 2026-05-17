'use client';

import React, { createContext, useContext, useState } from 'react';

const ContactModalContext = createContext();

export const ContactModalProvider = ({ children }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openContactForm = () => setIsFormOpen(true);
  const closeContactForm = () => setIsFormOpen(false);

  return (
    <ContactModalContext.Provider value={{ isFormOpen, openContactForm, closeContactForm }}>
      {children}
    </ContactModalContext.Provider>
  );
};

export const useContactModal = () => {
  const context = useContext(ContactModalContext);
  if (!context) {
    throw new Error('useContactModal must be used within a ContactModalProvider');
  }
  return context;
};
