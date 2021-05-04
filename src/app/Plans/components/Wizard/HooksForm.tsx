import * as React from 'react';
import TableEmptyState from '@app/common/components/TableEmptyState';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { PlanWizardFormState } from './PlanWizard';
import { TextContent, Text, Button } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

/// TODO replace this!
interface IHook {
  hello: string;
}

interface IHooksFormProps {
  form: PlanWizardFormState['hooks'];
}

const HooksForm: React.FunctionComponent<IHooksFormProps> = ({ form }: IHooksFormProps) => {
  const hooks: IHook[] = []; // TODO load from a query based on what's in the plan? or prefilled form state?

  const table =
    hooks.length === 0 ? (
      <TableEmptyState
        icon={PlusCircleIcon}
        bodyText="No hooks have been added to this migration plan"
      />
    ) : (
      <>
        <TextContent className={spacing.mbMd}>
          <Text component="p">
            Hooks are contained in Ansible playbooks that can be run before or after the migration.
          </Text>
        </TextContent>
        <h1>TODO</h1>
      </>
    );

  return (
    <>
      <Button variant="secondary" onClick={() => alert('TODO')}>
        Add hook
      </Button>
      {table}
    </>
  );
};

export default HooksForm;
