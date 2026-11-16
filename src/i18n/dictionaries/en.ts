/**
 * English interface text — the reference dictionary. tr.ts and fa.ts
 * must have exactly the same shape (TypeScript enforces it).
 */
export const en = {
  meta: {
    siteTitle: "Mendes | Law and Consultancy, Northern Cyprus",
    siteDescription:
      "Mendes Law and Consultancy advises private clients and businesses in Northern Cyprus on property, residency, companies, family matters and litigation — in English, Turkish and Persian.",
  },
  skip: "Skip to content",
  nav: {
    home: "Home",
    about: "About",
    practiceAreas: "Practice areas",
    team: "Team",
    insights: "Insights",
    contact: "Contact",
    consultation: "Request a consultation",
    menu: "Menu",
    close: "Close",
    primary: "Primary",
    language: "Language",
  },
  home: {
    eyebrow: "§ Mendes · Northern Cyprus",
    headline: "Counsel for decisions that cross borders.",
    lead: "Mendes advises individuals, families and businesses on property, residency, companies, family matters and disputes in Northern Cyprus — and explains the law in your language.",
    ctaPrimary: "Request a consultation",
    ctaSecondary: "View practice areas",
    philosophy: "We treat every matter as a system, not an event — because the decisions that matter most rarely happen in isolation.",
    practiceTitle: "Practice areas",
    practiceAll: "All practice areas",
    languagesTitle: "Advice in your language",
    languagesText: "Clients can work with us in English, Turkish and Persian. Documents can be explained in the client's own language before anything is signed.",
    closing: "Discuss your matter with Mendes.",
    closingSecondary: "Or get in touch",
  },
  about: {
    title: "About Mendes",
    lead: "A law and consultancy practice in Northern Cyprus for clients who need clear advice across languages and borders.",
    body: [
      "Many of the people we work with are buying property, moving their family, or setting up a business in Northern Cyprus for the first time. They need to understand what they are signing, in a language they read comfortably, and they need someone to take care of the steps with the authorities.",
      "Mendes was set up for that work. We explain the law plainly, put advice in writing, and tell clients early what a matter is likely to involve.",
    ],
    principlesTitle: "How we work",
    principles: [
      { title: "Clarity", text: "Advice in plain language, in writing, with the next steps and costs set out before work starts." },
      { title: "Confidentiality", text: "Everything a client tells us is treated as confidential." },
      { title: "Your language", text: "We work in English, Turkish and Persian." },
    ],
  },
  practice: {
    title: "Practice areas",
    lead: "The areas in which Mendes advises and represents clients.",
    whatWeDo: "What we do",
    related: "Other practice areas",
    discuss: "Discuss a matter in this area",
  },
  team: {
    title: "Team",
    lead: "The people you will work with.",
    education: "Education",
    bar: "Bar admission",
    languages: "Languages",
    areas: "Practice areas",
    publications: "Publications",
  },
  insights: {
    title: "Insights",
    lead: "Notes on law and practice in Northern Cyprus.",
    inEnglish: "In English",
    back: "All insights",
  },
  contact: {
    title: "Contact",
    lead: "Write to us or call. For a first discussion of your matter, use the consultation request.",
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    address: "Office",
    hours: "Office hours",
    directions: "Get directions",
    social: "Follow Mendes",
    mapTitle: "Map of the Mendes office",
    waHello: "Hello Mendes, I would like to ask about a legal matter.",
  },
  consultation: {
    title: "Request a consultation",
    lead: "Tell us briefly about your matter. We reply to confirm a time and whether we can help.",
    fullName: "Full name",
    email: "Email",
    phone: "Phone (optional)",
    area: "Practice area (optional)",
    areaNone: "Not sure / other",
    language: "Preferred language",
    message: "Your matter",
    messageHint: "Do not include confidential details yet. A short outline is enough.",
    submit: "Prepare email",
    viaWhatsapp: "Send via WhatsApp instead",
    privacyNote: "Pressing the button opens your email app with the request ready to send to {email}. This website does not store anything you type.",
    sentTitle: "Your request is ready to send",
    sentText: "Your email app has opened with the request addressed to {email}. Press send there to deliver it. If nothing opened, write to us directly at {email}.",
    edit: "Edit the request",
    subject: "Consultation request",
    errors: {
      fullName: "Please enter your full name.",
      email: "Please enter a valid email address.",
      phone: "Please check the phone number.",
      message: "Please describe your matter in a few sentences (at least 10 characters).",
    },
    noRelationship: "Sending a request does not create a lawyer–client relationship.",
  },
  legal: {
    privacyTitle: "Privacy",
    privacy: [
      "This website does not use cookies, analytics or advertising trackers, and it has no database.",
      "Forms are checked in your browser and then open your own email app (or WhatsApp) with the message ready to send. Nothing you type is sent to or stored by the website. Your message reaches Mendes only when you send it, and it is then handled as confidential correspondence.",
      "To show the page, your browser may load a map from OpenStreetMap on the contact page. That provider receives your IP address as part of the normal web request.",
      "Questions about your information: write to {email}.",
    ],
    disclaimerTitle: "Legal disclaimer",
    disclaimer: [
      "The information on this website is general information about the law of Northern Cyprus and about Mendes. It is not legal advice and should not be relied on for any particular matter.",
      "Using this website or contacting Mendes through it does not create a lawyer–client relationship. That relationship begins only once Mendes has confirmed in writing that it will act for you.",
      "Laws and official practice change. Mendes takes care to keep this website accurate but does not guarantee that it is complete or up to date.",
    ],
  },
  footer: {
    navigation: "Navigation",
    practice: "Practice areas",
    contact: "Contact",
    legal: "Legal",
    rights: "All rights reserved.",
    note: "Information on this site is not legal advice.",
  },
  langPicker: {
    title: "Choose your language",
  },
} as const;

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof en>;
