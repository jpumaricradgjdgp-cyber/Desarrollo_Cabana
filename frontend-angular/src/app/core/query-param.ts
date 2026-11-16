/**
 * Con withComponentInputBinding, un query param ausente llega como `undefined`
 * aunque el input tenga valor por defecto. Esta transformación lo convierte en texto vacío.
 */
export const optionalText = (value: string | null | undefined): string => value ?? '';
