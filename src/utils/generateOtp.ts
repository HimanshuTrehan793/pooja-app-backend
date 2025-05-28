export function generateOtp(length: number = 6): string {
  const otp = Math.floor(Math.random() * Math.pow(10, length)).toString();
  return otp.padStart(length, "0");
}
