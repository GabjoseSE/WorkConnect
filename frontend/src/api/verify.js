// Local stub: accept any code (no-op) to simplify local dev/test when providers are not configured.
export async function sendCode(contact, method = 'email') {
  // no network call in local dev; simulate async success
  return Promise.resolve({ success: true, debug: true, message: 'sendCode stubbed locally' });
}

export async function verifyCode(contact, code) {
  // accept any code locally
  return Promise.resolve({ valid: true, debug: true });
}
