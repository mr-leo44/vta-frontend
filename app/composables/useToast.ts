// composables/useToast.ts
import { toast as sonnerToast } from 'vue-sonner'

/**
 * Composable pour utiliser les toasts de manière cohérente dans l'application
 * Utilise vue-sonner sous le capot
 * 
 * @example
 * const { success, error } = useToast()
 * success('Opération réussie', 'Les données ont été sauvegardées')
 * error('Erreur', 'Une erreur est survenue')
 */
export const useToast = () => {
  const success = (title: string, description?: string) => {
    sonnerToast.success(title, {
      description
    })
  }

  const error = (title: string, description?: string) => {
    sonnerToast.error(title, {
      description
    })
  }

  const info = (title: string, description?: string) => {
    sonnerToast.info(title, {
      description
    })
  }

  const warning = (title: string, description?: string) => {
    sonnerToast.warning(title, {
      description
    })
  }

  const loading = (title: string, description?: string) => {
    return sonnerToast.loading(title, {
      description
    })
  }

  const promise = <T>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, options)
  }

  const dismiss = (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,
    toast: sonnerToast
  }
}

export type { ExternalToast } from 'vue-sonner'