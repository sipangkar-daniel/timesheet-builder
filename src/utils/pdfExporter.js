import html2pdf from 'html2pdf.js';

/**
 * Capture an HTML element and download it as a high-quality PDF.
 * Applies the 'pdf-render-mode' class to force solid black borders for print compliance.
 * 
 * @param {string} elementId - ID of the container element
 * @param {object} options - Export configurations
 * @param {string} options.filename - Output filename
 * @param {string} options.orientation - 'portrait' or 'landscape'
 * @param {number|array} options.margin - Page margin in mm
 * @returns {Promise}
 */
export const exportToPdf = (elementId, options = {}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return Promise.reject(`Element #${elementId} not found.`);
  }

  // Save the original zoom style to restore it later, and override it to 1 for perfect PDF scale
  const originalZoom = element.style.zoom;
  element.style.zoom = '1';

  // Inject a PDF render class to apply clean black borders and hide interactive forms
  element.classList.add('pdf-render-mode');

  // Temporarily disable dark mode on root element to ensure PDF renders in pure light mode
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    document.documentElement.classList.remove('dark');
  }

  // html2pdf options configuration
  const opt = {
    margin: options.margin !== undefined ? options.margin : 6,
    filename: options.filename || 'document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2.2, // Increase resolution for small font text inside grid
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: options.orientation || 'portrait',
      compress: true
    }
  };

  // Perform canvas conversion and download
  return html2pdf()
    .from(element)
    .set(opt)
    .save()
    .then(() => {
      // Restore default interactive styles
      element.classList.remove('pdf-render-mode');
      element.style.zoom = originalZoom;
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    })
    .catch((err) => {
      element.classList.remove('pdf-render-mode');
      element.style.zoom = originalZoom;
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
      console.error("html2pdf processing failed: ", err);
      throw err;
    });
};

