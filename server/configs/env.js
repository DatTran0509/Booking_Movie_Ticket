export const getCorsAllowedOrigins = () => {
  const rawOrigins = process.env.CORS_ALLOWED_ORIGINS || process.env.CLIENT_URL || '';

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const getPaymentHoldMinutes = () => {
  const configuredValue = Number(process.env.PAYMENT_HOLD_MINUTES || 10);

  if (!Number.isFinite(configuredValue) || configuredValue <= 0) {
    return 10;
  }

  return Math.floor(configuredValue);
};
