/**
 * Inline scripts that run before first paint. They live in a plain module
 * (not a "use client" file): importing a string from a client module into a
 * server component yields a client reference, not the string itself.
 */
export const INTRO_KEY = "mendes_intro";
export const THEME_KEY = "mendes_theme";

/** Marks <html data-intro> so the opening animation plays once per session. */
export const introBootScript = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="seen"}else{d.dataset.intro="playing"}}catch(e){document.documentElement.dataset.intro="seen"}})();`;

/** Applies the saved theme before paint so it never flashes. Dark is the brand default. */
export const themeBootScript = `(function(){try{if(localStorage.getItem("${THEME_KEY}")==="light")document.documentElement.dataset.theme="light"}catch(e){}})();`;
