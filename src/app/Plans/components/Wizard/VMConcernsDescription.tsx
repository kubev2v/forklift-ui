import { IVMwareVM } from '@app/queries/types';
import { TextContent, Text, List, ListItem } from '@patternfly/react-core';
import * as React from 'react';

interface IVMConcernsDescriptionProps {
  vm: IVMwareVM;
}

const criticalText = (
  <>
    Conditions have been identified that make this VM a <strong>high risk</strong> to migrate.
  </>
);
const warningText = (
  <>
    Conditions have been identified that make this VM a <strong>moderate risk</strong> to migrate.
  </>
);
const advisoryText = (
  <>Conditions have been identified, but they do not affect the migration risk.</>
);
const okText = <>No conditions have been identified that would make this VM a risk to migrate.</>;

const VMConcernsDescription: React.FunctionComponent<IVMConcernsDescriptionProps> = ({
  vm,
}: IVMConcernsDescriptionProps) => {
  // Default to warning if an unexpected severity is found
  let conditionsText = warningText;
  if (!vm.concerns || vm.concerns.length === 0) {
    conditionsText = okText;
  } else if (vm.concerns.some((concern) => concern.severity === 'Critical')) {
    conditionsText = criticalText;
  } else if (
    !vm.concerns.some((concern) => concern.severity === 'Warning') &&
    vm.concerns.some((concern) => concern.severity === 'Info' || concern.severity === 'Advisory')
  ) {
    conditionsText = advisoryText;
  }
  return (
    <TextContent>
      <Text component="p">{conditionsText}</Text>
      {vm.concerns && vm.concerns.length > 0 ? (
        <List>
          {vm.concerns.map((concern, index) => (
            <ListItem key={`${index}-${concern.name}`}>{concern.name}</ListItem>
          ))}
        </List>
      ) : null}
      <Text component="p">See the product documentation for more information.</Text>
    </TextContent>
  );
};

export default VMConcernsDescription;
