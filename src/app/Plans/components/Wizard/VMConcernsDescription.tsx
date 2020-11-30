import { PRODUCT_DOCO_LINK } from '@app/common/constants';
import { IVMwareVM } from '@app/queries/types';
import { TextContent, Text, List, ListItem } from '@patternfly/react-core';
import * as React from 'react';
import { getMostSevereVMConcern } from './helpers';

interface IVMConcernsDescriptionProps {
  vm: IVMwareVM;
}

const VMConcernsDescription: React.FunctionComponent<IVMConcernsDescriptionProps> = ({
  vm,
}: IVMConcernsDescriptionProps) => {
  const worstConcern = getMostSevereVMConcern(vm);
  const conditionsText = !worstConcern ? (
    <>No conditions have been identified that would make this VM a risk to migrate.</>
  ) : worstConcern.severity === 'Critical' ? (
    <>
      Conditions have been identified that make this VM a <strong>high risk</strong> to migrate.
    </>
  ) : worstConcern.severity === 'Warning' ? (
    <>
      Conditions have been identified that make this VM a <strong>moderate risk</strong> to migrate.
    </>
  ) : worstConcern.severity === 'Advisory' ? (
    <>Conditions have been identified, but they do not affect the migration risk.</>
  ) : null;
  if (vm.revisionAnalyzed < vm.revision) {
    return (
      <TextContent>
        <Text component="p">Completing migration Analysis. This might take a few minutes.</Text>
      </TextContent>
    );
  } else {
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
        <Text component="p">
          See the{' '}
          <a href={PRODUCT_DOCO_LINK.href} target="_blank" rel="noreferrer">
            {PRODUCT_DOCO_LINK.label}
          </a>{' '}
          for more information.
        </Text>
      </TextContent>
    );
  }
};

export default VMConcernsDescription;
