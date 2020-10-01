import * as React from 'react';
import * as yup from 'yup';
import { useFormState, useFormField } from '@app/common/hooks/useFormState';
import { IVMwareProvider, IOpenShiftProvider } from '@app/queries/types';

const usePlanWizardFormState = () => ({
  general: useFormState({
    planName: useFormField('', yup.string().label('Plan name').required()),
    planDescription: useFormField('', yup.string().label('Plan description').defined()),
    sourceProvider: useFormField<IVMwareProvider | null>(
      null,
      yup.mixed<IVMwareProvider>().label('Source provider').required()
    ),
    targetProvider: useFormField<IOpenShiftProvider | null>(
      null,
      yup.mixed<IOpenShiftProvider>().label('Target provider').required()
    ),
  }),
  filterVMs: useFormState({}),
});

type PlanWizardFormState = ReturnType<typeof usePlanWizardFormState>; // ✨ Magic

const PlanWizardFormContext = React.createContext<PlanWizardFormState>({} as PlanWizardFormState);

interface IPlanWizardFormContextProviderProps {
  children: React.ReactNode;
}

export const PlanWizardFormContextProvider: React.FunctionComponent<IPlanWizardFormContextProviderProps> = ({
  children,
}: IPlanWizardFormContextProviderProps) => (
  <PlanWizardFormContext.Provider value={usePlanWizardFormState()}>
    {children}
  </PlanWizardFormContext.Provider>
);

export const usePlanWizardFormContext = (): PlanWizardFormState =>
  React.useContext(PlanWizardFormContext);
