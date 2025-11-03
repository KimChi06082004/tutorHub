import emailjs from "emailjs-com";

export const sendOtpEmail = async (toEmail, otpCode) => {
  const templateParams = {
    to_name: toEmail.split("@")[0],
    to_email: toEmail,
    otp: otpCode,
  };

  return await emailjs.send(
    // "YOUR_SERVICE_ID",    // từ EmailJS dashboard
    "service_4f00h6i",
    // "YOUR_TEMPLATE_ID",   // template_reset
    "template_pd6oyjs", // template_reset

    templateParams,
    // "YOUR_PUBLIC_KEY"     // public key
    "4H_tEdckHd6-_Ya9Z" // public key
  );
};
