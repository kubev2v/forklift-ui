import * as React from 'react';
import { List, ListItem, Radio } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanWizardFormState } from './PlanWizard';
import { IVMwareVM } from '@app/queries/types';
import { someVMHasConcern } from './helpers';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

const warmCriticalConcerns = ['Changed Block Tracking (CBT) not enabled'];
const warmWarningConcerns = ['VM snapshot detected'];

interface ITypeFormProps {
  form: PlanWizardFormState['type'];
  selectedVMs: IVMwareVM[];
}

const TypeForm: React.FunctionComponent<ITypeFormProps> = ({
  form,
  selectedVMs,
}: ITypeFormProps) => {
  // TODO maybe we need to store only VM ids in selectedVMs state, and find the VM objects here so the concerns can be updated with polling?

  const warmCriticalConcernsFound = warmCriticalConcerns.filter((label) =>
    someVMHasConcern(selectedVMs, label)
  );
  const warmWarningConcernsFound = warmWarningConcerns.filter((label) =>
    someVMHasConcern(selectedVMs, label)
  );
  const warmWarnStatus: StatusType =
    warmCriticalConcernsFound.length > 0
      ? 'Error'
      : warmWarningConcernsFound.length > 0
      ? 'Warning'
      : 'Ok';

  return (
    <>
      <Radio
        id="migration-type-cold"
        name="migration-type"
        label="Cold migration"
        description={
          <List>
            <ListItem>Source VMs are shut down while all of the VM data is migrated.</ListItem>
          </List>
        }
        isChecked={form.values.type === 'Cold'}
        onChange={() => form.fields.type.setValue('Cold')}
        className={spacing.mbMd}
      />
      <Radio
        id="migration-type-warm"
        name="migration-type"
        label="Warm migration"
        description={
          <>
            <List>
              <ListItem>VM data is incrementally copied, leaving source VMs running.</ListItem>
              <ListItem>
                A final cutover, which shuts down the source VMs while VM data and metadata are
                copied, is run later.
              </ListItem>
            </List>
            {warmWarnStatus !== 'Ok' ? (
              <div className={`${spacing.mtMd} ${spacing.mlXs}`}>
                <StatusIcon
                  status={warmWarnStatus}
                  label={
                    <>
                      Warm migration {warmWarnStatus === 'Error' ? 'will' : 'might'} fail for one or
                      more VMs because of the following conditions:
                    </>
                  }
                />
                <List className={`${spacing.mtSm} ${spacing.mlMd}`}>
                  {[...warmCriticalConcernsFound, ...warmWarningConcernsFound].map((label) => (
                    <ListItem key={label}>{label}</ListItem>
                  ))}
                </List>
              </div>
            ) : null}
          </>
        }
        isChecked={form.values.type === 'Warm'}
        onChange={() => form.fields.type.setValue('Warm')}
      />
    </>
  );
};

export default TypeForm;
