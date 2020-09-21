import * as React from 'react';
import { Form, FormGroup, TreeView, Title } from '@patternfly/react-core';

// TODO replace with redux or equiv.
import { VMsOptions } from '@app/queries/mocks/vms.mock';

interface IFilterVMsProps {
  Inventory: [];
}

const FilterVMs: React.FunctionComponent<IFilterVMsProps> = ({ Inventory }: IFilterVMsProps) => {
  const [activeItems, setItems] = React.useState(VMsOptions);
  const [checkedItems, setCheckedItems] = React.useState([]);

  const onSelect = (event, treeViewItem, parentItem) => {
    return;
  };

  const onCheck = (event, treeViewItem) => {
    return;
  };

  return (
    <Form>
      <Title headingLevel="h2" size="md">
        Select datacenters, clusters and folders that contain the VMs to be included in the plan.
      </Title>
      <FormGroup
        isRequired
        fieldId="filterVMs"
        helperTextInvalid="TODO"
        validated="default" // TODO add state/validation/errors to this and other FormGroups
      >
        <TreeView
          data={VMsOptions}
          activeItems={activeItems}
          hasChecks
          onSearch={() => {
            return;
          }}
          onSelect={onSelect}
          onCheck={onCheck}
          searchProps={{
            id: 'inventory-search',
            name: 'search-inventory',
            'aria-label': 'Search inventory',
          }}
        />
      </FormGroup>
    </Form>
  );
};

export default FilterVMs;
