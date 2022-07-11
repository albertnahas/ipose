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
      height: user?.height || 170,
      heightIn: user?.heightIn || 0,
      weight: user?.weight || 70,
      goal: user?.goal || "",
      weightGoal: user?.weightGoal || user?.weight || 70,
      frequencyGoal: user?.frequencyGoal || 5,
      unit: user?.unit || "metric",
    },
    validationSchema: Yup.object({
      age: Yup.number().max(90).min(8).required("Age is required"),
      height: Yup.number().max(200).min(1).required("Height is required"),
      heightIn: Yup.number().max(20),
      weight: Yup.number().max(500).min(30).required("Weight is required"),
      weightGoal: Yup.number().max(500).min(30).required("Weight is required"),
      frequencyGoal: Yup.number()
        .max(7)
        .min(1)
        .required("Frequency is required"),
      goal: Yup.string(),
      gender: Yup.string().required("Gender is required"),
      unit: Yup.string().required("Unit is required"),
    }),
    onSubmit: (values, { resetForm, setErrors, setSubmitting }) => {
      updateUser({
        uid: user?.uid,
        ...values,
        complete: true,
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
