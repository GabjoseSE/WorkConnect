export async function validatePhone(countryCode, nationalNumber) {
  // countryCode like +63, nationalNumber like 9123456789
  const full = `${countryCode}${nationalNumber}`;
  try {
    const lib = await import('libphonenumber-js');
    const { parsePhoneNumberFromString } = lib;
    const parsed = parsePhoneNumberFromString(full);
    if (!parsed) return { valid: false };
    return { valid: parsed.isValid(), e164: parsed.number };
  } catch (err) {
    // Fallback: simple digit-only length check (not as accurate)
    const digits = (nationalNumber || '').replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return { valid: false };
    return { valid: true, e164: `${countryCode}${digits}` };
  }
}

// Named export only — avoids anonymous default export lint warnings
