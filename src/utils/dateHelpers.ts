/**
 * Utility functions for date handling and conversion
 */

/**
 * Converts a Date object or string to an ISO string
 * @param date - Date object or ISO string
 * @returns ISO string representation of the date
 */
export const toISOString = (date: Date | string | null | undefined): string | null | undefined => {
  if (date === null || date === undefined) {
    return date;
  }
  
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  return date;
};

/**
 * Converts a Date object or string to YYYY-MM-DD format
 * @param date - Date object or string
 * @returns YYYY-MM-DD string representation of the date
 */
export const toYYYYMMDD = (date: Date | string | null | undefined): string | null | undefined => {
  if (date === null || date === undefined) {
    return date;
  }
  
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // If it's already a string, try to parse and format it
  if (typeof date === 'string') {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
  }
  
  return date;
};

/**
 * Converts date fields in an object from Date objects to ISO strings
 * Useful for preparing data before sending to API
 * @param data - Object containing date fields
 * @param dateFields - Array of field names that should be converted
 * @returns New object with date fields converted to ISO strings
 */
export const convertDatesToISO = <T extends Record<string, any>>(
  data: T,
  dateFields: (keyof T)[]
): T => {
  const converted = { ...data };
  
  for (const field of dateFields) {
    if (field in converted) {
      (converted as any)[field] = toISOString(converted[field]);
    }
  }
  
  return converted;
};

/**
 * Converts date fields in an object from Date objects to YYYY-MM-DD format
 * Useful for preparing data before sending to API
 * @param data - Object containing date fields
 * @param dateFields - Array of field names that should be converted
 * @returns New object with date fields converted to YYYY-MM-DD strings
 */
export const convertDatesToYYYYMMDD = <T extends Record<string, any>>(
  data: T,
  dateFields: (keyof T)[]
): T => {
  const converted = { ...data };
  
  for (const field of dateFields) {
    if (field in converted) {
      (converted as any)[field] = toYYYYMMDD(converted[field]);
    }
  }
  
  return converted;
};
