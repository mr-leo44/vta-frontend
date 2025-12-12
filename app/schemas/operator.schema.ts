import { z } from 'zod'

export const operatorFormSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  
  sigle: z.string()
    .min(1, 'Le sigle est requis')
    .max(10, 'Le sigle ne peut pas dépasser 10 caractères')
    .toUpperCase(),
  
  iata_code: z.string()
    .max(5, 'Le code IATA ne peut pas dépasser 5 caractères')
    .toUpperCase()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  
  icao_code: z.string()
    .max(5, 'Le code OACI ne peut pas dépasser 5 caractères')
    .toUpperCase()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  
  country: z.string()
    .max(100, 'Le nom du pays ne peut pas dépasser 100 caractères')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  
  flight_type: z.enum(['regular', 'non_regular'], {
    errorMap: () => ({ message: 'Type de vol invalide' })
  }),
})

export type OperatorFormSchema = z.infer<typeof operatorFormSchema>