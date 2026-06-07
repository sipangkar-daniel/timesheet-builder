import React from 'react';

/**
 * High-fidelity inline SVG Mandiri Logo
 * Dark blue text "mandırı" with golden wing/wave symbol
 */
export const MandiriLogo = ({ className = "h-8", ...props }) => (
  <svg 
    viewBox="0 0 320 80" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* mandırı text */}
    <g fill="#0A3966">
      {/* m */}
      <path d="M25 55V31h4v4c2-3.5 5-5 9-5 4.5 0 7 2 8 5.5C49 32 52.5 30 56.5 30c6.5 0 9.5 4 9.5 11v14h-5V41c0-4-1.5-6-5-6-3.5 0-5.5 2-5.5 6v14h-5V41c0-4-1.5-6-5-6-3.5 0-5.5 2-5.5 6v14h-5z" />
      {/* a */}
      <path d="M85 55v-3.5c-2 2.5-5.5 4.5-9 4.5-6.5 0-10-4.5-10-10.5S70 35 76 35c3.5 0 7 2 9 4.5V36h5v19h-5zm-14-9.5c0 3.5 2 6.5 5.5 6.5s5.5-3 5.5-6.5S80 39 76.5 39 71 42 71 45.5z" />
      {/* n */}
      <path d="M96 55V31h5v4.5c2-3.5 5.5-5.5 9.5-5.5 6.5 0 9.5 4 9.5 11v14h-5V41c0-4.5-2-6.5-5.5-6.5s-6 2.5-6 6.5v14h-5.5z" />
      {/* d */}
      <path d="M140 55v-4c-2 2.5-5.5 4.5-9.5 4.5-7 0-11-5-11-12.5s4.5-13 11-13c4 0 7.5 2 9.5 4.5V20h5.5v35H140zm-15-12c0 4 2 7 6 7s6-3 6-7-2-7-6-7-6 3-6 7z" />
      {/* ı (dotless) */}
      <path d="M153 55V31h5v24h-5z" />
      {/* r */}
      <path d="M165 55V31h5v5.5c1.5-3.5 4.5-5.5 8-5.5 1 0 1.5 0 2 .5v5c-.5-.5-1.5-.5-2.5-.5-4 0-7.5 3-7.5 7.5V55h-5z" />
      {/* ı (dotless) */}
      <path d="M182 55V31h5v24h-5z" />
    </g>

    {/* Gold Wing / Wave Graphic */}
    <g>
      <path 
        d="M208 45C225 35 248 30 268 33C252 38 238 48 230 58C225 64 220 70 212 73C210 74 207 72 208 69C210 63 211 52 208 45Z" 
        fill="#F2A72B" 
      />
      <path 
        d="M228 35C248 24 275 22 298 26C280 32 265 44 256 55C251 61 247 67 238 70C236 71 233 69 234 66C236 60 234 44 228 35Z" 
        fill="#F9C23C" 
        opacity="0.85" 
      />
      <path 
        d="M250 25C272 15 302 14 320 20C302 26 288 38 280 50C276 56 271 61 264 64C262 65 259 63 260 60C262 54 258 35 250 25Z" 
        fill="#FAD165" 
        opacity="0.6" 
      />
    </g>
  </svg>
);

/**
 * Modern Tech-Corp Default Company Logo (SVG)
 */
export const DefaultCompanyLogo = ({ className = "h-8", ...props }) => (
  <svg 
    viewBox="0 0 200 60" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="200" height="60" rx="8" fill="#F3F4F6" className="dark:fill-gray-800" />
    <circle cx="35" cy="30" r="15" fill="#3B82F6" />
    <circle cx="45" cy="30" r="10" fill="#60A5FA" opacity="0.8" />
    <text 
      x="75" 
      y="36" 
      fontFamily="Outfit, sans-serif" 
      fontSize="18" 
      fontWeight="700" 
      fill="#1F2937" 
      className="dark:fill-white"
    >
      COMPANY
    </text>
  </svg>
);

/**
 * Modern Sleek Vendor Logo (SVG)
 */
export const DefaultVendorLogo = ({ className = "h-8", ...props }) => (
  <svg 
    viewBox="0 0 200 60" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="200" height="60" rx="8" fill="#F3F4F6" className="dark:fill-gray-800" />
    <path d="M20 20L35 40L50 20" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <text 
      x="70" 
      y="36" 
      fontFamily="Outfit, sans-serif" 
      fontSize="18" 
      fontWeight="700" 
      fill="#1F2937" 
      className="dark:fill-white"
    >
      VENDOR
    </text>
  </svg>
);

export const SunIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.313 4.313l1.591 1.591m12.192 12.192l1.591 1.591M3 12h2.25m13.5 0H21M4.313 19.687l1.591-1.591m12.192-12.192l1.591-1.591M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
  </svg>
);

export const MoonIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);
