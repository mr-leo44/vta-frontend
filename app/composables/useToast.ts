import { toast } from 'vue-sonner'

export const useToast = () => {
  const success = (title: string, description?: string) => {
    toast.success(title, {
      description,
      duration: 4000,
    })
  }

  const error = (title: string, description?: string) => {
    toast.error(title, {
      description,
      duration: 5000,
    })
  }

  const info = (title: string, description?: string) => {
    toast.info(title, {
      description,
      duration: 4000,
    })
  }

  const warning = (title: string, description?: string) => {
    toast.warning(title, {
      description,
      duration: 4000,
    })
  }

  const loading = (title: string, description?: string) => {
    return toast.loading(title, {
      description,
    })
  }

  const promise = <T,>(
    promise: Promise<T>,
    {
      loading: loadingMsg,
      success: successMsg,
      error: errorMsg,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading: loadingMsg,
      success: successMsg,
      error: errorMsg,
    })
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
  }
}