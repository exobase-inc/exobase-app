import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'


export const useFormation = <T, K extends { [key: string]: yup.AnySchema } = {}>(schema: K, defaultValues?: Partial<T>) => {
  const form = useForm<T>({
    resolver: yupResolver(yup.object(schema)),
    defaultValues: defaultValues as any
  })
  const hasError = Object.keys(form.formState.errors).length > 0
  return {
    watch: form.watch,
    register: form.register,
    createHandler: form.handleSubmit,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    hasError
  }
}