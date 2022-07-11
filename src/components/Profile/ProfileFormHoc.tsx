import { FC } from "react"
import { FormikProps, useFormik } from "formik"
import * as Yup from "yup"

import { User } from "../../types/user"
import { useUser } from "../../hooks/useUser"
import React from "react"

export function ProfileFormHoc<P>({ user, ...props }: Props) {
  const { updateUser } = useUser()
  const formik = useFormik<User>({
    initialValues: {
      age: user?.age || 25,
      gender: user?.gender || "male",
    },
    validationSchema: Yup.object({
      age: Yup.number().max(90).min(8).required("Age is required"),
      gender: Yup.string().required("Gender is required"),
    }),
    onSubmit: (values, { resetForm, setErrors, setSubmitting }) => {
      updateUser({
        uid: user?.uid,
        ...values,
      }).then(() => {
        props.onSubmitSuccess?.()
      })
    },
  })

  const ComponentWithProfileForm = (
    WrappedComponent: React.ComponentType<FormikProps<User>>
  ) => {
    return <WrappedComponent {...formik} />
  }
  return ComponentWithProfileForm
}

interface Props {
  user?: User | null
  onSubmitSuccess?: () => void
}
