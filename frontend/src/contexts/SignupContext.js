import React, { createContext, useContext, useState } from 'react';

const SignupContext = createContext(null);

export function SignupProvider({ children }) {
  const [data, setData] = useState({
    role: 'jobhunter', // default: job hunter / employee
    // Step 1: account
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    // Step 2: contact
    phone: '',
  phoneCountry: '+63',
    address: '',
    city: '',
    stateprovince: '',
    dateOfBirth: '',
    gender: '',
    // Step 3: professional
    resumeUrl: '',
    summary: '',
    skills: [],
    education: '',
    experienceYears: '',
    desiredPosition: '',
    workSetup: '',
    expectedSalary: '',
    // Step 4: preferences
    jobType: '',
  });

  const [currentStep, setCurrentStep] = useState(1);

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  return (
    <SignupContext.Provider value={{ data, update, currentStep, setCurrentStep }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error('useSignup must be used inside SignupProvider');
  return ctx;
}

export default SignupContext;
