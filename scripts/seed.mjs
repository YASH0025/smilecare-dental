#!/usr/bin/env node
/**
 * Generates the JSON "database" in /data with realistic, fictional sample data.
 * Dates are generated relative to TODAY so the calendar always has past, today
 * and upcoming appointments.  Run:  npm run seed
 *
 * All people, phone numbers and emails below are fictional.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "data");
mkdirSync(DATA, { recursive: true });

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
let seed = 20260930;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pad = (n, l = 2) => String(n).padStart(l, "0");
const today = new Date();
today.setHours(0, 0, 0, 0);
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const iso = (d, h = 10, m = 0) => {
  const x = new Date(d);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
};
const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const fromMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const write = (name, data) => writeFileSync(join(DATA, `${name}.json`), JSON.stringify(data, null, 2) + "\n");
const stamp = (daysAgo, h = 10) => iso(addDays(today, -daysAgo), h);

/* ------------------------------------------------------------------ */
/* settings & website content                                          */
/* ------------------------------------------------------------------ */
const settings = {
  name: "SmileCare Dental Clinic",
  tagline: "Healthy Smile. Confident You.",
  logoText: "SmileCare",
  logoUrl: "",
  phone: "+91 98260 45123",
  whatsapp: "+91 98260 45123",
  email: "hello@smilecare.com",
  address: "2nd Floor, Orbit Plaza, 14 New Palasia, Indore, Madhya Pradesh 452001",
  city: "Indore",
  emergencyContact: "+91 98260 45199",
  openingHours: [
    { label: "Monday – Saturday", hours: "10:00 AM – 7:00 PM" },
    { label: "Lunch break", hours: "1:30 PM – 2:30 PM" },
    { label: "Sunday", hours: "Emergencies only" },
  ],
  social: {
    instagram: "https://instagram.com/smilecare.indore",
    facebook: "https://facebook.com/smilecare.indore",
    youtube: "https://youtube.com/@smilecareindore",
    linkedin: "https://linkedin.com/company/smilecare-dental",
  },
  googleMapsUrl: "https://maps.google.com/?q=New+Palasia+Indore",
  googleMapsEmbedUrl: "https://www.google.com/maps?q=New%20Palasia%20Indore&output=embed",
  slotInterval: 30,
  bookingWindowDays: 60,
  taxRate: 0,
  currency: "INR",
  invoicePrefix: "SC",
  upiId: "", // set your clinic's UPI ID in Admin → Settings to enable UPI QR payments
  upiPayeeName: "SmileCare Dental Clinic",
};

const clinic = {
  hero: {
    eyebrow: "Premium dental care in Indore",
    title: "Advanced Dental Care,",
    highlight: "Designed Around You.",
    subtitle:
      "Modern dentistry with expert care, advanced technology and a comfortable patient experience — from your first check-up to a complete smile makeover.",
    image: "/images/hero-clinic.svg",
    primaryCta: "Book Appointment",
    secondaryCta: "Explore Services",
    trustPoints: ["Sterilisation-first protocols", "Digital X-rays & 3D scans", "Transparent, upfront pricing"],
  },
  stats: [
    { value: "10+", label: "Years Experience" },
    { value: "15,000+", label: "Happy Patients" },
    { value: "20+", label: "Treatments" },
    { value: "4.9/5", label: "Patient Rating" },
  ],
  whyChooseUs: [
    { icon: "award", title: "Experienced Dentists", description: "MDS specialists in implants, root canals and orthodontics — each with a decade of focused clinical work." },
    { icon: "scan", title: "Advanced Technology", description: "Digital radiography, intraoral scanning and rotary endodontics for precise, faster treatment." },
    { icon: "heart-handshake", title: "Personalized Treatment", description: "Every plan starts with a detailed consultation and is explained in plain language before we begin." },
    { icon: "sofa", title: "Comfortable Environment", description: "Calm, private operatories, gentle anaesthesia techniques and zero-rush appointments." },
    { icon: "receipt", title: "Transparent Pricing", description: "Written estimates before treatment. No surprise add-ons, and flexible payment options." },
    { icon: "calendar-check", title: "Easy Online Booking", description: "See real-time availability and book the slot that suits you in under a minute." },
  ],
  about: {
    title: "A modern dental practice built on trust",
    intro:
      "SmileCare was founded in Indore with a simple belief: excellent dentistry should feel calm, clear and genuinely personal.",
    story:
      "What began as a two-chair practice in New Palasia has grown into a specialist-led clinic trusted by families across Indore. We invested early in digital diagnostics and strict sterilisation standards, and we have kept our appointments deliberately unhurried so that every patient understands their options. Today our team of specialists works together on everything from routine cleanings to full-mouth rehabilitation — under one roof.",
    mission: "To deliver specialist-quality dental care with honesty, comfort and long-term oral health at its centre.",
    vision: "To be Central India's most trusted name in patient-first, evidence-based dentistry.",
    image: "/images/about-team.svg",
    values: [
      { icon: "shield-check", title: "Safety first", description: "Class-B autoclave sterilisation and single-use disposables for every patient." },
      { icon: "message-circle", title: "Clear communication", description: "We explain the why, the options and the cost before any treatment begins." },
      { icon: "sparkles", title: "Lasting results", description: "Materials and techniques chosen for durability, not shortcuts." },
    ],
    milestones: [
      { year: "2015", title: "SmileCare opens", description: "A two-chair practice in New Palasia, Indore." },
      { year: "2018", title: "Digital diagnostics", description: "Introduced digital X-rays and intraoral scanning." },
      { year: "2021", title: "Specialist team", description: "Implant, endodontic and orthodontic specialists join full-time." },
      { year: "2025", title: "15,000 patients", description: "A milestone we owe to our patients' referrals." },
    ],
  },
  cta: {
    title: "Ready to take care of your smile?",
    subtitle: "Book your consultation today — real-time slots, instant request, and a call back from our team.",
    button: "Book Appointment",
  },
  contact: {
    title: "We're here to help",
    subtitle: "Questions about a treatment, cost or availability? Send us a message and our front desk will get back to you within one working day.",
  },
};

/* ------------------------------------------------------------------ */
/* services                                                            */
/* ------------------------------------------------------------------ */
const S = (o) => ({ published: true, featured: false, ...o });
const servicesRaw = [
  S({
    slug: "dental-implants", name: "Dental Implants", category: "Implants", duration: 60, price: 25000, featured: true,
    description: "Permanent, natural-looking replacements for missing teeth, anchored securely in the jawbone.",
    content: "A dental implant is a small titanium post placed in the jawbone that acts as an artificial root. Once it integrates with the bone, a custom crown is attached — restoring the look, feel and chewing strength of a natural tooth. Implants also help preserve bone and keep neighbouring teeth from drifting.",
    benefits: ["Looks and feels like a natural tooth", "Preserves jawbone and facial structure", "No need to grind down adjacent teeth", "Can last decades with good care"],
    whoNeedsIt: ["Adults missing one or more teeth", "Patients unhappy with loose dentures", "Those with adequate bone density (or suitable for grafting)"],
    procedure: [
      { title: "Consultation & 3D planning", description: "Clinical exam, CBCT scan and a written treatment plan with costs." },
      { title: "Implant placement", description: "A short, comfortable procedure under local anaesthesia." },
      { title: "Healing (osseointegration)", description: "Typically 8–12 weeks while the implant fuses with bone." },
      { title: "Final crown", description: "A custom-shaded crown is fitted and your bite is fine-tuned." },
    ],
    recovery: "Mild soreness for 2–3 days is normal and managed with standard pain relief. Soft foods are advised for the first week. Most patients return to work the next day.",
    faqs: [
      { question: "Is implant surgery painful?", answer: "It is done under local anaesthesia and most patients describe it as easier than an extraction." },
      { question: "How long do implants last?", answer: "With good oral hygiene and regular check-ups, implants can last 20 years or more." },
    ],
  }),
  S({
    slug: "root-canal", name: "Root Canal Treatment", category: "Endodontics", duration: 60, price: 4500, featured: true,
    description: "Save an infected or painful tooth with precise, comfortable rotary root canal therapy.",
    content: "Root canal treatment removes infected or inflamed pulp from inside the tooth, disinfects the canals and seals them. Using rotary instruments and apex locators, most treatments are completed in one or two visits with minimal discomfort.",
    benefits: ["Relieves toothache quickly", "Saves your natural tooth", "Prevents spread of infection", "Usually completed in 1–2 visits"],
    whoNeedsIt: ["Severe or lingering tooth pain", "Sensitivity to hot or cold that doesn't settle", "A swollen gum or abscess near a tooth", "Deep decay reaching the nerve"],
    procedure: [
      { title: "Diagnosis & X-ray", description: "We confirm the cause and map the canals digitally." },
      { title: "Cleaning & shaping", description: "Infected pulp is removed and canals are disinfected." },
      { title: "Sealing", description: "Canals are filled and sealed with biocompatible material." },
      { title: "Crown", description: "A crown is usually recommended to protect the treated tooth." },
    ],
    recovery: "Tenderness when biting may last a few days. Avoid chewing hard foods on the tooth until the final crown is placed.",
    faqs: [
      { question: "Does a root canal hurt?", answer: "Modern anaesthesia makes it comparable to getting a filling. It relieves pain rather than causing it." },
      { question: "Do I need a crown afterwards?", answer: "For back teeth, a crown is strongly recommended to prevent fracture." },
    ],
  }),
  S({
    slug: "teeth-whitening", name: "Teeth Whitening", category: "Cosmetic", duration: 60, price: 8000, featured: true,
    description: "Professional in-clinic whitening that lifts stains safely — several shades brighter in one visit.",
    content: "Our in-clinic whitening uses a professional-grade gel activated under controlled conditions, with gums fully protected. It is safe for enamel and delivers far more predictable results than over-the-counter kits.",
    benefits: ["Visible results in a single session", "Gum protection throughout", "Custom take-home trays available", "Enamel-safe professional gel"],
    whoNeedsIt: ["Stains from tea, coffee or tobacco", "Age-related yellowing", "Anyone preparing for a special occasion"],
    procedure: [
      { title: "Shade assessment", description: "We record your starting shade and check for sensitivity." },
      { title: "Gum protection", description: "A protective barrier is applied to your gums." },
      { title: "Whitening sessions", description: "Gel is applied in timed cycles for even results." },
      { title: "Aftercare", description: "Desensitising treatment and diet advice for 48 hours." },
    ],
    recovery: "Mild sensitivity for 24–48 hours is common. Avoid strongly coloured food and drinks for two days.",
    faqs: [
      { question: "How long do results last?", answer: "Typically 12–24 months, depending on diet and habits." },
      { question: "Will whitening work on crowns?", answer: "No — whitening only affects natural enamel. We'll plan around existing restorations." },
    ],
  }),
  S({
    slug: "dental-crowns", name: "Crowns & Bridges", category: "Restorative", duration: 45, price: 6000,
    description: "Durable ceramic and zirconia crowns that restore strength and appearance to damaged teeth.",
    content: "Crowns cover and protect weakened teeth, while bridges replace a missing tooth by anchoring to neighbouring teeth. We use digital impressions and high-strength ceramics for accurate fit and natural shading.",
    benefits: ["Restores chewing strength", "Natural, stain-resistant finish", "Protects root-canal-treated teeth", "Digital impressions — no messy moulds"],
    whoNeedsIt: ["Cracked or heavily filled teeth", "Teeth after root canal treatment", "A single missing tooth (bridge)"],
    procedure: [
      { title: "Tooth preparation", description: "The tooth is shaped to make room for the crown." },
      { title: "Digital scan", description: "An intraoral scan captures a precise model." },
      { title: "Temporary crown", description: "Protects the tooth while the lab crafts your crown." },
      { title: "Fitting", description: "The final crown is checked, adjusted and cemented." },
    ],
    recovery: "Slight gum tenderness for a day or two. Normal eating can resume once the final crown is fitted.",
    faqs: [{ question: "Zirconia or porcelain?", answer: "Zirconia is stronger for back teeth; layered ceramics offer the best aesthetics at the front." }],
  }),
  S({
    slug: "porcelain-veneers", name: "Porcelain Veneers", category: "Cosmetic", duration: 60, price: 12000,
    description: "Ultra-thin ceramic shells that transform the shape, colour and alignment of front teeth.",
    content: "Veneers are custom-made porcelain shells bonded to the front surface of teeth. They correct chips, gaps, discolouration and minor misalignment with minimal tooth reduction.",
    benefits: ["Natural translucency", "Highly stain-resistant", "Minimal tooth preparation", "Corrects multiple concerns at once"],
    whoNeedsIt: ["Chipped or worn front teeth", "Gaps between teeth", "Deep stains that don't respond to whitening"],
    procedure: [
      { title: "Smile design", description: "Digital preview of your new smile before any work begins." },
      { title: "Preparation", description: "A thin layer of enamel is refined." },
      { title: "Bonding", description: "Veneers are bonded and polished." },
    ],
    recovery: "No downtime. Some patients notice brief sensitivity after preparation.",
    faqs: [{ question: "How many veneers do I need?", answer: "Most smile designs involve 6–10 upper teeth, but it depends on your smile line." }],
  }),
  S({
    slug: "clear-aligners", name: "Clear Aligners", category: "Orthodontics", duration: 45, price: 85000, featured: true,
    description: "Nearly invisible, removable aligners to straighten teeth without brackets or wires.",
    content: "Clear aligners gradually move teeth using a series of custom trays planned digitally. They're removable for eating and brushing, and practically invisible in daily life.",
    benefits: ["Virtually invisible", "Removable for meals and brushing", "Fewer clinic visits", "Digital preview of your final result"],
    whoNeedsIt: ["Crowded or spaced teeth", "Mild to moderate bite issues", "Adults who prefer discreet treatment"],
    procedure: [
      { title: "Scan & plan", description: "3D scan and a digital simulation of tooth movement." },
      { title: "Aligner series", description: "Switch to a new set every 1–2 weeks." },
      { title: "Progress checks", description: "Short reviews every 6–8 weeks." },
      { title: "Retention", description: "Retainers keep your new smile in place." },
    ],
    recovery: "Each new set may feel tight for a day or two — a sign they're working.",
    faqs: [{ question: "How many hours a day?", answer: "Aligners should be worn 20–22 hours daily for predictable results." }],
  }),
  S({
    slug: "braces", name: "Metal & Ceramic Braces", category: "Orthodontics", duration: 45, price: 35000,
    description: "Reliable fixed orthodontics for teens and adults, with tooth-coloured ceramic options.",
    content: "Fixed braces remain the most versatile option for correcting complex crowding and bite problems. Ceramic brackets offer a discreet alternative to traditional metal.",
    benefits: ["Treats complex cases", "Predictable, controlled results", "Discreet ceramic option", "Cost-effective"],
    whoNeedsIt: ["Teens with crowding or bite issues", "Adults with complex alignment needs"],
    procedure: [
      { title: "Records", description: "Photos, X-rays and models for planning." },
      { title: "Bonding", description: "Brackets are attached and wires placed." },
      { title: "Adjustments", description: "Monthly visits to progress treatment." },
    ],
    recovery: "Mild soreness for a few days after placement and adjustments.",
    faqs: [{ question: "How long is treatment?", answer: "Usually 12–24 months depending on complexity." }],
  }),
  S({
    slug: "dental-cleaning", name: "Scaling & Polishing", category: "Preventive", duration: 30, price: 1500,
    description: "Thorough professional cleaning to remove plaque and tartar and keep gums healthy.",
    content: "Professional scaling removes hardened tartar that brushing cannot, followed by polishing to smooth the tooth surface and reduce future build-up.",
    benefits: ["Fresher breath", "Healthier gums", "Removes surface stains", "Prevents gum disease"],
    whoNeedsIt: ["Everyone — every 6 months", "Bleeding gums while brushing", "Visible tartar build-up"],
    procedure: [
      { title: "Examination", description: "Gum health check and charting." },
      { title: "Ultrasonic scaling", description: "Gentle removal of tartar." },
      { title: "Polishing", description: "Smooths enamel and removes stains." },
    ],
    recovery: "No downtime. Slight gum sensitivity for a day is normal.",
    faqs: [{ question: "Does cleaning damage enamel?", answer: "No. Professional scaling removes deposits, not enamel." }],
  }),
  S({
    slug: "tooth-fillings", name: "Tooth-Coloured Fillings", category: "Restorative", duration: 30, price: 1800,
    description: "Invisible composite fillings that repair cavities and blend seamlessly with your teeth.",
    content: "Composite fillings are bonded directly to the tooth, requiring less drilling than metal fillings and matching the natural shade of your teeth.",
    benefits: ["Matches natural tooth colour", "Conservative preparation", "Bonded for strength", "Completed in one visit"],
    whoNeedsIt: ["Small to medium cavities", "Chipped teeth", "Replacing old silver fillings"],
    procedure: [
      { title: "Decay removal", description: "Affected tooth structure is removed gently." },
      { title: "Layering", description: "Composite is placed in thin, cured layers." },
      { title: "Shaping & polish", description: "Bite adjusted and surface polished." },
    ],
    recovery: "You can eat normally once numbness wears off.",
    faqs: [{ question: "How long do fillings last?", answer: "Composite fillings typically last 7–10 years." }],
  }),
  S({
    slug: "tooth-extraction", name: "Tooth Extraction", category: "Oral Surgery", duration: 30, price: 1500,
    description: "Gentle, atraumatic removal of damaged or non-restorable teeth.",
    content: "When a tooth cannot be saved, we perform atraumatic extractions that protect surrounding bone — important if you plan to replace it with an implant later.",
    benefits: ["Relieves pain from non-restorable teeth", "Bone-preserving technique", "Clear aftercare guidance"],
    whoNeedsIt: ["Severely broken or decayed teeth", "Advanced gum disease", "Orthodontic space requirements"],
    procedure: [
      { title: "Assessment", description: "X-ray and discussion of replacement options." },
      { title: "Extraction", description: "Performed under local anaesthesia." },
      { title: "Aftercare", description: "Written instructions and a follow-up check." },
    ],
    recovery: "Avoid rinsing, straws and smoking for 24 hours. Most discomfort settles within 2–3 days.",
    faqs: [{ question: "Should I replace an extracted tooth?", answer: "Usually yes — gaps can cause neighbouring teeth to shift." }],
  }),
  S({
    slug: "wisdom-tooth-removal", name: "Wisdom Tooth Removal", category: "Oral Surgery", duration: 60, price: 6500,
    description: "Safe surgical removal of impacted or painful wisdom teeth.",
    content: "Impacted wisdom teeth can cause pain, infection and damage to adjacent teeth. We plan each case with digital imaging for a safe, efficient procedure.",
    benefits: ["Prevents recurring infection", "Protects neighbouring teeth", "Planned with digital imaging"],
    whoNeedsIt: ["Pain or swelling at the back of the mouth", "Partially erupted wisdom teeth", "Recurrent gum infection around wisdom teeth"],
    procedure: [
      { title: "Imaging", description: "OPG or CBCT to assess position and nerves." },
      { title: "Surgery", description: "Performed under local anaesthesia." },
      { title: "Review", description: "Suture check after one week." },
    ],
    recovery: "Expect swelling for 2–4 days. Cold compresses and soft foods help. Most patients take one or two days off.",
    faqs: [{ question: "Do all wisdom teeth need removal?", answer: "No — only those causing problems or likely to." }],
  }),
  S({
    slug: "pediatric-dentistry", name: "Children's Dentistry", category: "Pediatric", duration: 30, price: 800,
    description: "Friendly, preventive dental care that helps children build healthy habits early.",
    content: "Our child-friendly appointments focus on prevention — fluoride application, pit-and-fissure sealants and gentle treatment — in an environment designed to make kids feel at ease.",
    benefits: ["Positive first experiences", "Preventive sealants & fluoride", "Growth monitoring", "Habit counselling"],
    whoNeedsIt: ["Children from their first tooth", "Kids with cavities or sensitivity", "Thumb-sucking or habit concerns"],
    procedure: [
      { title: "Tell-show-do", description: "We explain every step in child-friendly language." },
      { title: "Check-up", description: "Gentle exam and cleaning." },
      { title: "Prevention", description: "Fluoride or sealants as needed." },
    ],
    recovery: "No downtime.",
    faqs: [{ question: "When should my child first visit?", answer: "By their first birthday or when the first tooth appears." }],
  }),
  S({
    slug: "gum-treatment", name: "Gum Disease Treatment", category: "Periodontics", duration: 45, price: 3500,
    description: "Deep cleaning and periodontal care to treat bleeding, receding or infected gums.",
    content: "Gum disease is the leading cause of tooth loss in adults. Deep cleaning (root planing) removes bacteria below the gumline and allows gums to heal and reattach.",
    benefits: ["Stops bleeding gums", "Reduces bad breath", "Helps prevent tooth loss"],
    whoNeedsIt: ["Bleeding or swollen gums", "Receding gums", "Loose teeth"],
    procedure: [
      { title: "Charting", description: "Pocket depths measured around every tooth." },
      { title: "Deep cleaning", description: "Root surfaces cleaned under anaesthesia." },
      { title: "Maintenance", description: "Review in 6–8 weeks." },
    ],
    recovery: "Gums may be tender for a few days. Warm salt-water rinses help healing.",
    faqs: [{ question: "Is gum disease reversible?", answer: "Early gingivitis is fully reversible; periodontitis can be controlled." }],
  }),
  S({
    slug: "dentures", name: "Complete & Partial Dentures", category: "Prosthodontics", duration: 60, price: 18000,
    description: "Comfortable, natural-looking dentures designed for a secure fit and confident smile.",
    content: "Modern dentures are custom-designed for comfort and appearance. Implant-supported options offer significantly better stability.",
    benefits: ["Restores chewing and speech", "Natural-looking teeth and gums", "Implant-retained options"],
    whoNeedsIt: ["Multiple missing teeth", "Loose or ill-fitting old dentures"],
    procedure: [
      { title: "Impressions", description: "Detailed moulds of your gums." },
      { title: "Try-in", description: "Preview fit, bite and appearance." },
      { title: "Delivery", description: "Final fit with adjustments." },
    ],
    recovery: "An adjustment period of 2–4 weeks is normal.",
    faqs: [{ question: "Can I sleep with dentures?", answer: "We recommend removing them at night to let gums rest." }],
  }),
  S({
    slug: "smile-makeover", name: "Smile Makeover", category: "Cosmetic", duration: 90, price: 45000,
    description: "A personalised combination of cosmetic treatments to redesign your smile.",
    content: "A smile makeover combines whitening, veneers, contouring and alignment to achieve your ideal smile — planned digitally so you can preview the result first.",
    benefits: ["Digital smile preview", "Comprehensive, coordinated plan", "Life-changing confidence"],
    whoNeedsIt: ["Multiple cosmetic concerns", "Upcoming milestones such as weddings"],
    procedure: [
      { title: "Smile design", description: "Photos, scans and a digital mock-up." },
      { title: "Treatment phases", description: "Sequenced whitening, veneers or aligners." },
      { title: "Finishing", description: "Final polish and maintenance plan." },
    ],
    recovery: "Depends on the treatments involved.",
    faqs: [{ question: "How long does a makeover take?", answer: "From two weeks to several months, depending on the plan." }],
  }),
  S({
    slug: "dental-consultation", name: "Consultation & Digital X-Ray", category: "General", duration: 30, price: 500,
    description: "A thorough examination with digital X-rays and a clear, written treatment plan.",
    content: "Every journey at SmileCare begins with a full consultation: oral examination, digital X-rays where needed, and an honest conversation about your options and costs.",
    benefits: ["Comprehensive diagnosis", "Low-radiation digital X-rays", "Written estimate"],
    whoNeedsIt: ["New patients", "Anyone with pain or concerns", "Second opinions"],
    procedure: [
      { title: "History", description: "Medical and dental history review." },
      { title: "Examination", description: "Teeth, gums, bite and soft tissues." },
      { title: "Plan", description: "Options, timelines and costs explained." },
    ],
    recovery: "None.",
    faqs: [{ question: "Is the consultation fee adjusted?", answer: "Yes — it's adjusted against treatment started within 30 days." }],
  }),
];
const services = servicesRaw.map((s, i) => ({
  id: `SRV-${pad(i + 1, 3)}`,
  image: `/images/services/${s.slug}.svg`,
  createdAt: stamp(400 - i),
  updatedAt: stamp(30),
  ...s,
}));
const sid = (slug) => services.find((s) => s.slug === slug).id;

/* ------------------------------------------------------------------ */
/* dentists                                                            */
/* ------------------------------------------------------------------ */
const week = (days, start = "10:00", end = "19:00") =>
  [0, 1, 2, 3, 4, 5, 6].map((d) => ({ day: d, enabled: days.includes(d), start, end, breakStart: "13:30", breakEnd: "14:30" }));

const dentists = [
  {
    id: "DR-001", slug: "dr-ananya-deshmukh", name: "Dr. Ananya Deshmukh", photo: "/images/dentists/dr-ananya-deshmukh.svg",
    qualification: "BDS, MDS (Prosthodontics & Implantology)", specialization: "Implants & Cosmetic Dentistry", experienceYears: 12,
    bio: "Dr. Ananya leads SmileCare's implant and smile-design programme. She completed her MDS in Prosthodontics and has placed over 1,800 implants. Patients appreciate her calm manner and meticulous planning — every case starts with a digital preview.",
    languages: ["English", "Hindi", "Marathi"],
    serviceIds: ["dental-implants", "dental-crowns", "porcelain-veneers", "teeth-whitening", "dentures", "smile-makeover", "dental-consultation", "tooth-extraction"].map(sid),
    workingHours: week([1, 2, 3, 4, 5, 6]), leaves: [{ id: "lv1", from: key(addDays(today, 18)), to: key(addDays(today, 19)), reason: "Implantology conference" }], active: true,
  },
  {
    id: "DR-002", slug: "dr-rohan-mehta", name: "Dr. Rohan Mehta", photo: "/images/dentists/dr-rohan-mehta.svg",
    qualification: "BDS, MDS (Conservative Dentistry & Endodontics)", specialization: "Root Canals & Restorative Care", experienceYears: 9,
    bio: "Dr. Rohan specialises in saving natural teeth. He uses rotary endodontics and magnification for precise, comfortable root canal treatment, and is known for making anxious patients feel at ease.",
    languages: ["English", "Hindi", "Gujarati"],
    serviceIds: ["root-canal", "tooth-fillings", "dental-cleaning", "gum-treatment", "tooth-extraction", "wisdom-tooth-removal", "teeth-whitening", "dental-consultation", "dental-crowns"].map(sid),
    workingHours: week([1, 2, 3, 4, 5, 6]), leaves: [], active: true,
  },
  {
    id: "DR-003", slug: "dr-kavya-iyer", name: "Dr. Kavya Iyer", photo: "/images/dentists/dr-kavya-iyer.svg",
    qualification: "BDS, MDS (Orthodontics & Dentofacial Orthopaedics)", specialization: "Orthodontics & Children's Dentistry", experienceYears: 7,
    bio: "Dr. Kavya is a certified clear-aligner provider who treats teens and adults with braces and aligners. She also runs our children's clinic, with a gentle, tell-show-do approach.",
    languages: ["English", "Hindi", "Tamil"],
    serviceIds: ["clear-aligners", "braces", "pediatric-dentistry", "dental-cleaning", "dental-consultation"].map(sid),
    workingHours: week([2, 3, 4, 5, 6], "11:00", "19:00"), leaves: [], active: true,
  },
].map((d, i) => ({ ...d, createdAt: stamp(600 - i * 40), updatedAt: stamp(20) }));

/* ------------------------------------------------------------------ */
/* patients                                                            */
/* ------------------------------------------------------------------ */
const patientSeed = [
  ["Aarav Sharma", "MALE", "1988-04-12", "B+", "Vijay Nagar"],
  ["Priya Patel", "FEMALE", "1992-09-03", "O+", "Palasia"],
  ["Rahul Verma", "MALE", "1979-01-22", "A+", "Rajendra Nagar"],
  ["Sneha Kulkarni", "FEMALE", "1995-06-17", "AB+", "Sapna Sangeeta"],
  ["Vikram Singh Rathore", "MALE", "1984-11-30", "O-", "Bhawarkuan"],
  ["Neha Joshi", "FEMALE", "1990-02-08", "B+", "Annapurna"],
  ["Arjun Malhotra", "MALE", "2001-07-25", "A-", "Scheme No. 54"],
  ["Ishita Agrawal", "FEMALE", "1998-12-14", "O+", "Nipania"],
  ["Mohit Choudhary", "MALE", "1975-05-05", "B-", "Rau"],
  ["Kavita Nair", "FEMALE", "1968-03-19", "A+", "Old Palasia"],
  ["Siddharth Jain", "MALE", "1993-08-09", "O+", "Sukhliya"],
  ["Ananya Gupta", "FEMALE", "2012-10-02", "B+", "Tilak Nagar"],
  ["Rakesh Tiwari", "MALE", "1965-12-27", "AB-", "Mhow Naka"],
  ["Pooja Saxena", "FEMALE", "1987-04-30", "A+", "Bengali Square"],
  ["Harsh Vardhan", "MALE", "1999-01-11", "O+", "Khandwa Road"],
  ["Meera Bhatt", "FEMALE", "1982-07-07", "B+", "MR 10"],
  ["Aditya Rao", "MALE", "1996-09-21", "A+", "LIG Colony"],
  ["Divya Pandey", "FEMALE", "1991-05-15", "O-", "Manorama Ganj"],
  ["Karan Mehra", "MALE", "1986-02-02", "B+", "Saket Nagar"],
  ["Tanvi Deshpande", "FEMALE", "2009-11-19", "A+", "Mahalaxmi Nagar"],
  ["Nikhil Soni", "MALE", "1994-03-03", "O+", "Bicholi Mardana"],
  ["Riya Kapoor", "FEMALE", "1997-08-28", "AB+", "AB Road"],
];
const allergyPool = ["None known", "None known", "None known", "Penicillin", "Latex (mild)", "Sulfa drugs", "None known"];
const historyPool = ["No significant medical history", "Controlled hypertension", "Type 2 diabetes (on metformin)", "Mild asthma", "No significant medical history", "Thyroid (on medication)"];
const dentalHistoryPool = [
  "Regular 6-monthly check-ups. Two composite fillings (2021).",
  "Previous RCT on 36 at another clinic. Occasional sensitivity.",
  "Irregular dental visits. Complains of bleeding gums while brushing.",
  "Orthodontic treatment as a teenager. Wears night retainer occasionally.",
  "Extraction of 48 in 2019. No complications.",
  "First visit to a dentist in over three years.",
];

const patients = patientSeed.map(([name, gender, dob, bg, area], i) => {
  const first = name.split(" ")[0].toLowerCase();
  const created = addDays(today, -(260 - i * 11));
  return {
    id: `P-${pad(i + 1, 4)}`,
    name,
    phone: `+91 9${String(8100000000 + i * 734219).slice(1, 5)} ${String(10000 + i * 3571).slice(-5)}`,
    email: `${first}.${name.split(" ").slice(-1)[0].toLowerCase()}@example.com`,
    dateOfBirth: dob,
    gender,
    address: `${10 + i * 7}, ${area}, Indore`,
    bloodGroup: bg,
    allergies: allergyPool[i % allergyPool.length],
    medicalHistory: historyPool[i % historyPool.length],
    dentalHistory: dentalHistoryPool[i % dentalHistoryPool.length],
    emergencyContact: `Family · +91 97${pad(i, 2)}0 1${pad(i * 3, 2)}88`,
    status: i === 12 ? "INACTIVE" : "ACTIVE",
    dentalChart: {},
    notes: [],
    documents: [],
    createdAt: iso(created, 11),
    updatedAt: iso(created, 11),
  };
});

// Some dental chart data + notes/documents
const chartSets = [
  { "16": "FILLED", "26": "DECAY", "36": "ROOT_CANAL", "46": "CROWN" },
  { "11": "FILLED", "21": "FILLED", "37": "DECAY" },
  { "18": "MISSING", "28": "MISSING", "38": "MISSING", "48": "MISSING", "36": "IMPLANT" },
  { "46": "EXTRACTION_REQUIRED", "47": "DECAY", "15": "FILLED" },
  { "24": "ROOT_CANAL", "25": "CROWN" },
];
patients.forEach((p, i) => {
  const set = chartSets[i % chartSets.length];
  if (i % 3 !== 2) {
    for (const [tooth, condition] of Object.entries(set)) {
      p.dentalChart[tooth] = { condition, notes: "", updatedAt: p.createdAt };
    }
  }
  if (i % 2 === 0) {
    p.notes.push({ id: `n${i}a`, text: "Patient prefers late-morning appointments. Mild dental anxiety — explain each step.", author: "Dr. Clinic Admin", createdAt: p.createdAt });
  }
  if (i % 3 === 0) {
    p.documents.push({ id: `d${i}a`, name: "OPG X-ray", type: "X_RAY", date: key(new Date(p.createdAt)), notes: "Baseline full-mouth radiograph" });
    p.documents.push({ id: `d${i}b`, name: "Treatment consent", type: "CONSENT", date: key(new Date(p.createdAt)), notes: "" });
  }
});

/* ------------------------------------------------------------------ */
/* appointments                                                        */
/* ------------------------------------------------------------------ */
const reasons = {
  "dental-implants": "Replace missing lower molar",
  "root-canal": "Severe pain in upper left tooth",
  "teeth-whitening": "Whitening before a family wedding",
  "dental-crowns": "Crown after root canal",
  "porcelain-veneers": "Chipped front tooth",
  "clear-aligners": "Crowded lower front teeth",
  braces: "Orthodontic review",
  "dental-cleaning": "Routine cleaning",
  "tooth-fillings": "Cavity noticed during brushing",
  "tooth-extraction": "Broken tooth, cannot be saved",
  "wisdom-tooth-removal": "Recurring pain at the back of the jaw",
  "pediatric-dentistry": "Child's six-monthly check-up",
  "gum-treatment": "Bleeding gums",
  dentures: "Loose old denture",
  "smile-makeover": "Smile design consultation",
  "dental-consultation": "General check-up",
};

const appointments = [];
const busy = new Map(); // `${dentist}|${date}` -> [ [start,end] ]
function tryBook(offset, dentist, serviceSlug, patient, statusFn) {
  const date = addDays(today, offset);
  const wd = dentist.workingHours.find((w) => w.day === date.getDay());
  if (!wd || !wd.enabled) return false;
  if (dentist.leaves.some((l) => key(date) >= l.from && key(date) <= l.to)) return false;
  const service = services.find((s) => s.slug === serviceSlug);
  if (!dentist.serviceIds.includes(service.id)) return false;
  const k = `${dentist.id}|${key(date)}`;
  const taken = busy.get(k) ?? [];
  const candidates = [];
  for (let t = toMin(wd.start); t + service.duration <= toMin(wd.end); t += 30) {
    const e = t + service.duration;
    if (t < toMin(wd.breakEnd) && toMin(wd.breakStart) < e) continue;
    if (taken.some(([a, b]) => t < b && a < e)) continue;
    candidates.push(t);
  }
  if (!candidates.length) return false;
  const start = pick(candidates);
  taken.push([start, start + service.duration]);
  busy.set(k, taken);
  const status = statusFn(offset);
  const created = addDays(date, -Math.max(2, Math.floor(rand() * 10)));
  const history = [{ at: iso(created, 9, 15), status: "PENDING", note: "Booked online" }];
  if (status !== "PENDING") history.push({ at: iso(addDays(created, 1), 11), status: status === "CANCELLED" && rand() < 0.5 ? "CANCELLED" : "CONFIRMED" });
  if (["COMPLETED", "NO_SHOW", "RESCHEDULED"].includes(status)) history.push({ at: iso(date, 18), status });
  if (status === "CANCELLED" && history[history.length - 1].status !== "CANCELLED") history.push({ at: iso(addDays(date, -1), 17), status: "CANCELLED", note: "Patient requested" });
  const id = `APT-${1001 + appointments.length}`;
  appointments.push({
    id,
    patientId: patient.id,
    patientName: patient.name,
    phone: patient.phone,
    email: patient.email,
    serviceId: service.id,
    dentistId: dentist.id,
    date: key(date),
    time: fromMin(start),
    duration: service.duration,
    status,
    reason: reasons[serviceSlug] ?? "Consultation",
    notes: rand() < 0.3 ? "Prefers SMS reminders." : "",
    source: pick(["ONLINE", "ONLINE", "PHONE", "WALK_IN"]),
    history,
    createdAt: iso(created, 9, 15),
    updatedAt: iso(date, 18),
  });
  return true;
}
const pastStatus = () => {
  const r = rand();
  return r < 0.74 ? "COMPLETED" : r < 0.87 ? "CANCELLED" : "NO_SHOW";
};
const futureStatus = () => {
  const r = rand();
  return r < 0.45 ? "PENDING" : r < 0.85 ? "CONFIRMED" : "RESCHEDULED";
};
const statusFor = (offset) => (offset < 0 ? pastStatus() : offset === 0 ? pick(["CONFIRMED", "CONFIRMED", "PENDING", "COMPLETED"]) : futureStatus());

const serviceByDentist = {
  "DR-001": ["dental-implants", "dental-crowns", "porcelain-veneers", "teeth-whitening", "dental-consultation", "smile-makeover", "dentures"],
  "DR-002": ["root-canal", "tooth-fillings", "dental-cleaning", "gum-treatment", "tooth-extraction", "wisdom-tooth-removal", "dental-consultation"],
  "DR-003": ["clear-aligners", "braces", "pediatric-dentistry", "dental-cleaning", "dental-consultation"],
};
let attempts = 0;
for (let offset = -45; offset <= 21 && attempts < 4000; offset++) {
  const perDay = offset === 0 ? 5 : offset > 0 && offset <= 7 ? 3 : offset > 7 && offset <= 14 ? 2 : offset < 0 && offset > -30 ? 1 : rand() < 0.5 ? 1 : 0;
  for (let n = 0; n < perDay; n++) {
    attempts++;
    const dentist = pick(dentists);
    const patient = patients[Math.floor(rand() * patients.length)];
    const slug = pick(serviceByDentist[dentist.id]);
    if (patient.status === "INACTIVE" && offset >= 0) continue;
    const effectivePatient = slug === "pediatric-dentistry" ? pick(patients.filter((p) => p.dateOfBirth > "2008")) : patient;
    tryBook(offset, dentist, slug, effectivePatient, statusFor);
  }
}
appointments.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
appointments.forEach((a, i) => (a.id = `APT-${1001 + i}`));
// Guarantee at least a couple of rescheduled bookings for the demo
appointments
  .filter((a) => a.date > key(today) && a.status === "CONFIRMED")
  .slice(0, 2)
  .forEach((a) => {
    a.status = "RESCHEDULED";
    a.history.push({ at: iso(addDays(today, -1), 12), status: "RESCHEDULED", note: "Moved at patient's request" });
  });

/* ------------------------------------------------------------------ */
/* treatments                                                          */
/* ------------------------------------------------------------------ */
const plan = (title, labels, doneCount) => ({ title, steps: labels.map((l, i) => ({ id: `s${i + 1}`, label: l, done: i < doneCount })) });
const treatmentPlans = [
  ["P-0001", "DR-002", "root-canal", plan("Root Canal Treatment — 36", ["Consultation", "X-Ray", "Root Canal", "Crown", "Follow-up"], 2), 9000, ["36"]],
  ["P-0002", "DR-001", "teeth-whitening", plan("In-clinic Whitening", ["Shade assessment", "Whitening session", "Take-home trays", "Review"], 4), 8000, []],
  ["P-0003", "DR-001", "dental-implants", plan("Implant — 36", ["Consultation", "CBCT scan", "Implant placement", "Healing review", "Final crown"], 3), 32000, ["36"]],
  ["P-0004", "DR-003", "clear-aligners", plan("Clear Aligner Therapy", ["Records & scan", "Digital plan approval", "Aligners 1–10", "Aligners 11–20", "Retainers"], 2), 85000, []],
  ["P-0005", "DR-002", "tooth-extraction", plan("Extraction — 46", ["Consultation", "X-Ray", "Extraction", "Suture review"], 1), 2000, ["46"]],
  ["P-0006", "DR-002", "gum-treatment", plan("Periodontal Therapy", ["Charting", "Deep cleaning — upper", "Deep cleaning — lower", "Re-evaluation"], 4), 7000, []],
  ["P-0007", "DR-003", "braces", plan("Ceramic Braces", ["Records", "Bonding", "Monthly adjustments", "Debonding", "Retainers"], 3), 42000, []],
  ["P-0010", "DR-001", "dentures", plan("Upper Complete Denture", ["Impressions", "Bite registration", "Try-in", "Delivery", "Adjustment"], 2), 18000, []],
  ["P-0011", "DR-002", "tooth-fillings", plan("Composite Fillings — 16, 26", ["Consultation", "Filling 16", "Filling 26"], 3), 3600, ["16", "26"]],
  ["P-0014", "DR-001", "porcelain-veneers", plan("Veneers — 11, 21", ["Smile design", "Preparation", "Temporaries", "Bonding"], 1), 24000, ["11", "21"]],
  ["P-0016", "DR-002", "root-canal", plan("Root Canal Treatment — 24", ["Consultation", "X-Ray", "Root Canal", "Crown", "Follow-up"], 5), 10500, ["24"]],
  ["P-0012", "DR-003", "pediatric-dentistry", plan("Preventive Sealants", ["Check-up", "Fluoride", "Sealants 36, 46"], 0), 1800, ["36", "46"]],
];
const treatments = treatmentPlans.map(([patientId, dentistId, slug, p, cost, teeth], i) => {
  const done = p.steps.filter((s) => s.done).length;
  const status = done === 0 ? "PLANNED" : done === p.steps.length ? "COMPLETED" : "IN_PROGRESS";
  const start = addDays(today, -(70 - i * 5));
  return {
    id: `TRT-${pad(i + 1, 4)}`,
    patientId, dentistId, serviceId: sid(slug), title: p.title, teeth, steps: p.steps, cost, status,
    startDate: key(start),
    endDate: status === "COMPLETED" ? key(addDays(start, 21)) : undefined,
    followUpDate: status !== "COMPLETED" ? key(addDays(today, 5 + i)) : undefined,
    notes: status === "IN_PROGRESS" ? "Progressing as planned. Patient compliant with instructions." : status === "PLANNED" ? "Awaiting patient confirmation of plan." : "Treatment completed successfully.",
    createdAt: iso(start, 12), updatedAt: iso(addDays(today, -2), 12),
  };
});

/* ------------------------------------------------------------------ */
/* prescriptions                                                       */
/* ------------------------------------------------------------------ */
const meds = {
  amox: { name: "Amoxicillin 500 mg", dosage: "1 capsule", frequency: "Three times a day", duration: "5 days", instructions: "After meals. Complete the full course." },
  ibu: { name: "Ibuprofen 400 mg", dosage: "1 tablet", frequency: "Twice a day", duration: "3 days", instructions: "After food, only if in pain." },
  para: { name: "Paracetamol 650 mg", dosage: "1 tablet", frequency: "When required (max 3/day)", duration: "3 days", instructions: "For pain or fever." },
  metro: { name: "Metronidazole 400 mg", dosage: "1 tablet", frequency: "Three times a day", duration: "5 days", instructions: "Avoid alcohol during the course." },
  chx: { name: "Chlorhexidine 0.2% mouthwash", dosage: "10 ml", frequency: "Twice a day", duration: "7 days", instructions: "Rinse for 30 seconds. Don't eat for 30 min after." },
  sens: { name: "Potassium nitrate toothpaste", dosage: "Pea-sized", frequency: "Twice a day", duration: "4 weeks", instructions: "Leave on teeth for a minute before rinsing." },
  panto: { name: "Pantoprazole 40 mg", dosage: "1 tablet", frequency: "Once daily", duration: "5 days", instructions: "Before breakfast, with the antibiotic course." },
};
const rxSeed = [
  ["P-0001", "DR-002", "Irreversible pulpitis — 36", ["amox", "ibu", "panto"], "Avoid chewing on the left side until the crown is placed."],
  ["P-0003", "DR-001", "Post implant placement — 36", ["amox", "para", "chx"], "Soft diet for 5 days. Cold compress for swelling."],
  ["P-0005", "DR-002", "Post extraction — 46", ["para", "chx"], "Do not spit or use a straw for 24 hours."],
  ["P-0006", "DR-002", "Chronic generalised periodontitis", ["metro", "chx"], "Brush twice daily with a soft brush; interdental cleaning."],
  ["P-0002", "DR-001", "Post-whitening sensitivity", ["sens"], "Avoid tea, coffee and coloured foods for 48 hours."],
  ["P-0009", "DR-002", "Acute periapical abscess — 26", ["amox", "metro", "ibu"], "Return if swelling increases."],
  ["P-0011", "DR-002", "Dentine hypersensitivity", ["sens"], "Use a soft-bristled toothbrush."],
  ["P-0016", "DR-002", "Post RCT — 24", ["ibu"], "Crown appointment in two weeks."],
  ["P-0008", "DR-001", "Pericoronitis — 38", ["amox", "chx", "para"], "Warm saline rinses thrice daily."],
  ["P-0017", "DR-002", "Gingivitis", ["chx"], "Scaling appointment recommended."],
];
const prescriptions = rxSeed.map(([patientId, dentistId, diagnosis, medKeys, advice], i) => {
  const d = addDays(today, -(40 - i * 4));
  return {
    id: `RX-${pad(i + 1, 4)}`,
    patientId, dentistId, date: key(d), diagnosis, medicines: medKeys.map((k) => meds[k]), advice,
    createdAt: iso(d, 13), updatedAt: iso(d, 13),
  };
});

/* ------------------------------------------------------------------ */
/* invoices & payments (from completed appointments)                  */
/* ------------------------------------------------------------------ */
const invoices = [];
const payments = [];
const completed = appointments.filter((a) => a.status === "COMPLETED");
const methods = ["UPI", "UPI", "CARD", "CASH", "UPI", "BANK_TRANSFER", "ONLINE"];
const addInvoice = (patientId, date, items, payPlan, notes = "") => {
  const n = invoices.length + 1;
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discountTotal = items.reduce((s, i) => s + i.discount, 0);
  const total = subtotal - discountTotal;
  let paidGross = 0;
  let refunded = 0;
  payPlan.forEach((pp, j) => {
    const amount = Math.round(pp.share * total);
    if (amount <= 0) return;
    if (pp.type === "REFUND") refunded += amount;
    else paidGross += amount;
    payments.push({
      id: `PAY-${pad(payments.length + 1, 4)}`,
      invoiceId: `INV-${pad(n, 4)}`,
      patientId,
      amount,
      method: pp.method ?? methods[(n + j) % methods.length],
      type: pp.type ?? "PAYMENT",
      date: key(new Date(Math.min(addDays(new Date(date), pp.after ?? 0).getTime(), today.getTime()))),
      reference: pp.method === "CASH" ? "" : `TXN${String(700000 + n * 97 + j).padStart(8, "0")}`,
      notes: pp.type === "REFUND" ? "Refund for cancelled procedure" : "",
      createdAt: iso(addDays(new Date(date), pp.after ?? 0), 16),
      updatedAt: iso(addDays(new Date(date), pp.after ?? 0), 16),
    });
  });
  const balance = Math.max(0, total - paidGross);
  const paid = paidGross - refunded;
  const status = refunded > 0 && paid <= 0 ? "REFUNDED" : paidGross <= 0 ? "UNPAID" : paidGross < total ? "PARTIAL" : "PAID";
  invoices.push({
    id: `INV-${pad(n, 4)}`,
    number: `SC-${date.slice(0, 4)}-${pad(n, 4)}`,
    patientId,
    date,
    dueDate: key(addDays(new Date(date), 15)),
    items,
    taxRate: 0,
    subtotal, discountTotal, tax: 0, total, paid, refunded, balance, status, notes,
    createdAt: iso(new Date(date), 15), updatedAt: iso(new Date(date), 15),
  });
};
completed.forEach((a, i) => {
  const svc = services.find((s) => s.id === a.serviceId);
  const items = [{ id: `li${i}a`, description: svc.name, serviceId: svc.id, quantity: 1, price: svc.price, discount: i % 5 === 0 ? Math.round(svc.price * 0.1) : 0 }];
  if (i % 4 === 1) items.push({ id: `li${i}b`, description: "Digital X-Ray (IOPA)", quantity: 1, price: 300, discount: 0 });
  const r = i % 6;
  const plan = r === 0 ? [{ share: 0.5 }] : r === 3 ? [] : [{ share: 1 }];
  addInvoice(a.patientId, a.date, items, plan);
});
// A few hand-crafted invoices so every billing state is represented
const extra = [0, 1, 2, 3];
for (const r of extra) {
  const p = patients[(r * 5 + 3) % patients.length];
  const d = key(addDays(today, -(r * 9 + 12)));
  const svc = services[[0, 5, 2, 13][r]];
  addInvoice(
    p.id,
    d,
    [{ id: `lx${invoices.length}`, description: svc.name, serviceId: svc.id, quantity: 1, price: svc.price, discount: 0 }],
    r === 0 ? [{ share: 0.4 }, { share: 0.3, after: 7 }] : r === 1 ? [{ share: 0.25 }] : r === 2 ? [{ share: 1 }, { share: 1, type: "REFUND", after: 3, method: "UPI" }] : [],
    r === 2 ? "Procedure postponed at patient request — full refund issued." : "",
  );
}
// Historical billing (2–6 months back) so revenue charts show a trend
for (let m = 6; m >= 2; m--) {
  const perMonth = 5 + ((m * 3) % 4);
  for (let k = 0; k < perMonth; k++) {
    const p = patients[(m * 7 + k * 3) % patients.length];
    const svc = services[(m * 5 + k * 2) % services.length];
    const d = new Date(today.getFullYear(), today.getMonth() - m, 3 + k * 4);
    addInvoice(p.id, key(d), [{ id: `lh${m}${k}`, description: svc.name, serviceId: svc.id, quantity: 1, price: Math.min(svc.price, 30000), discount: 0 }], [{ share: 1 }]);
  }
}
invoices.sort((a, b) => a.date.localeCompare(b.date));

/* ------------------------------------------------------------------ */
/* CMS: portfolio, gallery, testimonials, FAQs, leads                  */
/* ------------------------------------------------------------------ */
const portfolioSeed = [
  ["Full smile whitening", "Teeth Whitening", "Whitening", "DR-001", "1 visit", "whitening"],
  ["Single-tooth implant", "Dental Implants", "Implants", "DR-001", "3 months", "implant"],
  ["Crowding corrected with aligners", "Clear Aligners", "Orthodontics", "DR-003", "11 months", "aligners"],
  ["Six-unit veneer smile", "Porcelain Veneers", "Cosmetic", "DR-001", "2 weeks", "veneers"],
  ["Chipped incisor restored", "Tooth-Coloured Fillings", "Restorative", "DR-002", "1 visit", "bonding"],
  ["Gap closure", "Braces", "Orthodontics", "DR-003", "9 months", "gap"],
  ["Tea-stain removal", "Scaling & Polishing", "Whitening", "DR-002", "1 visit", "cleaning"],
  ["Zirconia crown on molar", "Crowns & Bridges", "Restorative", "DR-002", "1 week", "crown"],
  ["Complete smile makeover", "Smile Makeover", "Cosmetic", "DR-001", "6 weeks", "makeover"],
  ["Implant bridge", "Dental Implants", "Implants", "DR-001", "4 months", "bridge"],
];
const portfolio = portfolioSeed.map(([title, treatment, category, dentistId, duration, img], i) => ({
  id: `PF-${pad(i + 1, 3)}`,
  title, treatment, category, dentistId, duration,
  beforeImage: `/images/portfolio/${img}-before.svg`,
  afterImage: `/images/portfolio/${img}-after.svg`,
  description: `${treatment} case completed by ${dentists.find((d) => d.id === dentistId).name}. Images shown with patient consent; results vary between individuals.`,
  published: i !== 9,
  createdAt: stamp(200 - i * 12), updatedAt: stamp(200 - i * 12),
}));

const gallerySeed = [
  ["Reception & waiting lounge", "CLINIC", "reception"],
  ["Treatment suite 1", "CLINIC", "operatory"],
  ["Sterilisation zone", "EQUIPMENT", "sterilisation"],
  ["Digital X-ray unit", "EQUIPMENT", "xray"],
  ["Intraoral scanner", "EQUIPMENT", "scanner"],
  ["Our clinical team", "TEAM", "team"],
  ["Front desk team", "TEAM", "frontdesk"],
  ["Implant surgery in progress", "TREATMENTS", "surgery"],
  ["Aligner fitting", "TREATMENTS", "aligner-fit"],
  ["Kids' dental camp 2025", "EVENTS", "camp"],
  ["World Oral Health Day", "EVENTS", "oralhealthday"],
  ["Consultation room", "CLINIC", "consult"],
];
const gallery = gallerySeed.map(([title, category, img], i) => ({
  id: `GAL-${pad(i + 1, 3)}`,
  title, category, image: `/images/gallery/${img}.svg`, description: "", order: i + 1, published: true,
  createdAt: stamp(300 - i * 10), updatedAt: stamp(300 - i * 10),
}));

const testimonialSeed = [
  ["Priya P.", "Palasia", 5, "Teeth Whitening", "I was nervous about sensitivity, but Dr. Ananya explained everything beforehand. The result was natural and exactly what I wanted for my sister's wedding."],
  ["Rahul V.", "Rajendra Nagar", 5, "Dental Implants", "Lost a molar years ago and finally got an implant. Planning was thorough, the surgery was quicker than I expected, and it feels like my own tooth."],
  ["Sneha K.", "Sapna Sangeeta", 5, "Clear Aligners", "Dr. Kavya showed me a 3D preview before starting. Eleven months later my smile is straight and nobody even noticed I was wearing aligners."],
  ["Mohit C.", "Rau", 4, "Root Canal Treatment", "I dreaded a root canal but it was genuinely painless. Clear pricing, and they called the next day to check on me."],
  ["Kavita N.", "Old Palasia", 5, "Complete Dentures", "My new denture fits so much better than my old one. The team was patient through every adjustment."],
  ["Siddharth J.", "Sukhliya", 5, "Tooth-Coloured Fillings", "Fast, clean and professional. Online booking showed real slots and I was seen right on time."],
  ["Meera B.", "MR 10", 5, "Scaling & Polishing", "The cleanest clinic I've visited. Sterilisation is clearly taken seriously and the staff are warm."],
  ["Aditya R.", "LIG Colony", 5, "Wisdom Tooth Removal", "Swelling was minimal and the aftercare instructions were very clear. Back at work in two days."],
  ["Divya P.", "Manorama Ganj", 4, "Gum Disease Treatment", "My gums stopped bleeding within weeks. Dr. Rohan explained the cause instead of just treating it."],
  ["Harsh V.", "Khandwa Road", 5, "Porcelain Veneers", "Chipped my front tooth in a cricket match. The veneer is indistinguishable from my other teeth."],
  ["Anita S.", "Vijay Nagar", 5, "Children's Dentistry", "My daughter actually looks forward to her check-ups now. Wonderful with kids."],
];
const testimonials = testimonialSeed.map(([patientName, location, rating, treatment, review], i) => ({
  id: `TST-${pad(i + 1, 3)}`,
  patientName, location, rating, review, treatment,
  date: key(addDays(today, -(15 + i * 17))),
  status: i === 10 ? "PENDING" : "APPROVED",
  createdAt: stamp(15 + i * 17), updatedAt: stamp(15 + i * 17),
}));

const faqSeed = [
  ["General", "Do I need an appointment, or can I walk in?", "We recommend booking online or by phone so we can reserve time for you. Walk-ins are accommodated when a slot is free, and dental emergencies are always prioritised."],
  ["General", "What should I bring to my first visit?", "Please bring any previous dental X-rays or reports, a list of current medications, and arrive 10 minutes early to complete a short medical history form."],
  ["General", "Is parking available?", "Yes — Orbit Plaza has basement parking for patients, and we're a short walk from the New Palasia bus stop."],
  ["General", "Do you treat dental emergencies?", "Yes. Call our emergency line for severe pain, swelling, trauma or bleeding. On Sundays we see emergencies by prior call."],
  ["Appointments", "How do I reschedule or cancel?", "Call or WhatsApp our front desk at least 24 hours in advance, and we'll move your appointment to a time that suits you."],
  ["Appointments", "How long does a typical appointment take?", "Check-ups and cleanings take 30 minutes; root canals and implant procedures usually take about an hour. Your booking confirmation shows the expected duration."],
  ["Appointments", "Will I receive a confirmation?", "Online requests are reviewed by our team, who confirm your slot and send you a reminder before the visit."],
  ["Treatments", "Are root canal treatments painful?", "With modern anaesthesia and rotary instruments, most patients feel little more than they would during a filling."],
  ["Treatments", "How long do dental implants last?", "With good hygiene and regular check-ups, implants can last 20 years or longer."],
  ["Treatments", "Is teeth whitening safe for enamel?", "Professional whitening under supervision is safe for enamel. Temporary sensitivity may occur and settles within 48 hours."],
  ["Treatments", "At what age should my child see a dentist?", "By their first birthday, or as soon as the first tooth appears."],
  ["Payments", "What payment methods do you accept?", "Cash, UPI, all major debit and credit cards, bank transfer and online payment links."],
  ["Payments", "Do you offer EMI or instalment plans?", "Yes, for implant, aligner and smile makeover treatments. Ask our front desk for current options."],
  ["Payments", "Will I get a written estimate?", "Always. You'll receive a written treatment plan with costs before any procedure begins."],
  ["Safety", "How do you sterilise instruments?", "All instruments go through ultrasonic cleaning and Class-B autoclave sterilisation, and we use single-use disposables wherever possible."],
  ["Safety", "Are digital X-rays safe?", "Digital X-rays use up to 80% less radiation than conventional film and are only taken when clinically necessary."],
];
const faqs = faqSeed.map(([category, question, answer], i) => ({
  id: `FAQ-${pad(i + 1, 3)}`,
  question, answer, category, order: i + 1, published: true,
  createdAt: stamp(365 - i), updatedAt: stamp(60),
}));

const leadSeed = [
  ["Rohit Bansal", "Dental Implants", "Looking for implant cost for two missing teeth.", "NEW", "WEBSITE"],
  ["Shweta Mishra", "Clear Aligners", "Do you offer EMI for aligners?", "CONTACTED", "WEBSITE"],
  ["Gaurav Arora", "Teeth Whitening", "Wedding in December — want whitening.", "FOLLOW_UP", "SOCIAL"],
  ["Nidhi Rawat", "Children's Dentistry", "My son (6) has a cavity. Earliest slot?", "CONVERTED", "PHONE"],
  ["Amit Khanna", "Root Canal Treatment", "Severe pain since yesterday.", "CONVERTED", "WEBSITE"],
  ["Sonal Dubey", "Porcelain Veneers", "Want to fix gaps in front teeth.", "NEW", "WEBSITE"],
  ["Vivek Chauhan", "Wisdom Tooth Removal", "Second opinion on wisdom tooth removal.", "LOST", "REFERRAL"],
  ["Kritika Sethi", "Smile Makeover", "Interested in a smile design consultation.", "FOLLOW_UP", "SOCIAL"],
  ["Manish Yadav", "Complete & Partial Dentures", "For my father — loose dentures.", "CONTACTED", "WALK_IN"],
  ["Payal Thakur", "Scaling & Polishing", "Routine cleaning, weekend slot?", "NEW", "WEBSITE"],
  ["Deepak Bhargava", "Gum Disease Treatment", "Bleeding gums for a month.", "NEW", "WEBSITE"],
];
const leads = leadSeed.map(([name, interestedService, message, status, source], i) => ({
  id: `LD-${pad(i + 1, 4)}`,
  name,
  phone: `+91 98${pad(30 + i, 2)}${i % 10} ${pad(40 + i * 3, 2)}${pad(100 + i * 7, 3)}`,
  email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  interestedService, message, source, status,
  notes: status === "LOST" ? "Chose a clinic closer to home." : status === "FOLLOW_UP" ? "Call back after 5 PM." : "",
  createdAt: stamp(1 + i * 4, 9 + (i % 8)), updatedAt: stamp(i * 3),
}));

const notifications = [
  ["APPOINTMENT_REQUESTED", "New appointment request", `${appointments.find((a) => a.status === "PENDING")?.patientName ?? "A patient"} requested an appointment online.`, "/admin/appointments?status=PENDING", false, 0],
  ["NEW_LEAD", "New website enquiry", "Rohit Bansal · Dental Implants", "/admin/leads", false, 1],
  ["PAYMENT_RECEIVED", "Payment received", "₹4,500 via UPI · SC invoice", "/admin/billing", true, 2],
  ["APPOINTMENT_CONFIRMED", "Appointment confirmed", "Tomorrow's 11:00 AM slot confirmed.", "/admin/calendar", true, 3],
  ["NEW_PATIENT", "New patient registered", "Riya Kapoor (P-0022)", "/admin/patients/P-0022", true, 5],
  ["APPOINTMENT_REMINDER", "Reminders queued", "Tomorrow's reminders are ready to send (simulated).", "/admin/calendar", true, 6],
].map(([type, title, message, link, read, hoursAgo], i) => ({
  id: `NTF-${pad(i + 1, 5)}`,
  type, title, message, link, read,
  channels: ["IN_APP"],
  createdAt: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
}));

/* ------------------------------------------------------------------ */
write("settings", settings);
write("clinic", clinic);
write("services", services);
write("dentists", dentists);
write("patients", patients);
write("appointments", appointments);
write("treatments", treatments);
write("prescriptions", prescriptions);
write("invoices", invoices);
write("payments", payments);
write("portfolio", portfolio);
write("gallery", gallery);
write("testimonials", testimonials);
write("faqs", faqs);
write("leads", leads);
write("notifications", notifications);

console.log(
  `Seeded: ${services.length} services, ${dentists.length} dentists, ${patients.length} patients, ${appointments.length} appointments, ` +
    `${treatments.length} treatments, ${prescriptions.length} prescriptions, ${invoices.length} invoices, ${payments.length} payments, ` +
    `${portfolio.length} portfolio, ${gallery.length} gallery, ${testimonials.length} testimonials, ${faqs.length} FAQs, ${leads.length} leads.`,
);
