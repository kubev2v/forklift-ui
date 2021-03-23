import * as React from 'react';
import { List, ListItem, Radio } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanWizardFormState } from './PlanWizard';

interface ITypeFormProps {
  form: PlanWizardFormState['type'];
}

const TypeForm: React.FunctionComponent<ITypeFormProps> = ({ form }: ITypeFormProps) => (
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
        <List>
          <ListItem>VM data is incrementally copied, leaving source VMs running.</ListItem>
          <ListItem>
            A final cutover, which shuts down the source VMs while VM data and metadata are copied,
            is run later.
          </ListItem>
        </List>
      }
      isChecked={form.values.type === 'Warm'}
      onChange={() => form.fields.type.setValue('Warm')}
    />
  </>
);

export default TypeForm;
