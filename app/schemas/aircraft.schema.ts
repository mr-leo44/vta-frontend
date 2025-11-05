import { z } from 'zod'

export const aircraftFormSchema = z.object({
  immatriculation: z.string()
    .min(1, 'L\'immatriculation est requise')
    .max(50, 'L\'immatriculation ne peut pas dépasser 50 caractères')
    .regex(/^[A-Z0-9-]+$/, 'Format invalide (lettres majuscules, chiffres et tirets uniquement)'),
  
  pmad: z.number()
    .int('Le PMAD doit être un nombre entier')
    .positive('Le PMAD doit être positif')
    .nullable()
    .optional(),
  
  in_activity: z.boolean({
    required_error: 'Le statut d\'activité est requis'
  }),
  
  aircraft_type_id: z.number({
    required_error: 'Le type d\'aéronef est requis'
  }).int().positive('Veuillez sélectionner un type d\'aéronef valide'),
  
  operator_id: z.number({
    required_error: 'L\'exploitant est requis'
  }).int().positive('Veuillez sélectionner un exploitant valide')
})

export type AircraftFormSchema = z.infer<typeof aircraftFormSchema>