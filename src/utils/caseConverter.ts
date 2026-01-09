/**
 * Utility functions for converting between camelCase and snake_case
 */

/**
 * Converts a camelCase string to snake_case
 * @param str - The camelCase string to convert
 * @returns The snake_case string
 */
export const camelToSnake = (str: string): string => {
  // If already in snake_case (contains underscore and no uppercase after underscore), return as is
  if (str.includes('_') && !/[A-Z]/.test(str)) {
    return str;
  }
  // Convert camelCase to snake_case
  const result = str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  // Remove leading underscore if the original string started with uppercase
  return result.startsWith('_') ? result.slice(1) : result;
};

/**
 * Converts a snake_case string to camelCase
 * @param str - The snake_case string to convert
 * @returns The camelCase string
 */
export const snakeToCamel = (str: string): string => {
  // If already in camelCase (no underscores or has uppercase without underscore), return as is
  if (!str.includes('_')) {
    return str;
  }
  // Convert snake_case to camelCase
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively converts all keys in an object from camelCase to snake_case
 * @param obj - The object to convert
 * @returns A new object with snake_case keys
 */
export const convertKeysToSnakeCase = <T>(obj: T): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToSnakeCase(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      converted[snakeKey] = convertKeysToSnakeCase(value);
    }
    return converted;
  }

  return obj;
};

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 * @param obj - The object to convert
 * @returns A new object with camelCase keys
 */
export const convertKeysToCamelCase = <T>(obj: T): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamelCase(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      converted[camelKey] = convertKeysToCamelCase(value);
    }
    return converted;
  }

  return obj;
};

