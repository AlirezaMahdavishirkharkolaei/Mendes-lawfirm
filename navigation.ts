export interface NavItem {
  label: string;
  href: string;
}

/** Primary navigation, shared by the desktop Nav, MobileNav, and Footer. */
export const primaryNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Practice areas", href: "/practice-areas" },
  { label: "Attorneys", href: "/attorneys" },
  { label: "Insights", href: "/insights" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export const consultationCta: NavItem = {
  label: "Request a consultation",
  href: "/consultation",
};

export const footerLegalLinks: NavItem[] = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Legal disclaimer", href: "/disclaimer" },
];
