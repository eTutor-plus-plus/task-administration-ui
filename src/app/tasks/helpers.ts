/**
 * Converts the string to the type (required for p-tag).
 *
 * @param severity The severity string.
 */
export function convertStringToSeverity(severity: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
  if (severity === '')
    return undefined;
  return severity as any;
}
