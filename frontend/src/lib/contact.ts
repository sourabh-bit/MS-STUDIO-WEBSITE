// WhatsApp numbers used across the site, in wa.me format (country code, no
// "+" or spaces). `school` is the MS Art School line for class enquiries;
// `booking` is the makeup-appointment line.
export const WHATSAPP_NUMBERS = {
  school: "919818793850",
  booking: "918448229694",
} as const;

export const ONLINE_CLASS_WHATSAPP_GREETING =
  "Hi! I'd like to know more about the Meera Sakhrani Online Masterclass.";

export const whatsappUrl = (number: string, message?: string) =>
  `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
