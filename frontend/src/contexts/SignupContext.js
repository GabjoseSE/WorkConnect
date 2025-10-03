import React, { createContext, useContext, useState } from 'react';

const SignupContext = createContext(null);

export function SignupProvider({ children }) {
  const [data, setData] = useState({
    role: 'jobhunter', // default: job hunter / employee
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  return (
    <SignupContext.Provider value={{ data, update }}>
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
