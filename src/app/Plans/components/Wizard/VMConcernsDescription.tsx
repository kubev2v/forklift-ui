import { PRODUCT_DOCO_LINK } from '@app/common/constants';
import { IVMwareVM } from '@app/queries/types';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { TextContent, Text, List, ListItem } from '@patternfly/react-core';
import * as React from 'react';
import { getMostSevereVMConcern, getVMConcernStatusLabel, getVMConcernStatusType } from './helpers';

interface IVMConcernsDescriptionProps {
  vm: IVMwareVM;
}

const VMConcernsDescription: React.FunctionComponent<IVMConcernsDescriptionProps> = ({
  vm,
}: IVMConcernsDescriptionProps) => {
  const worstConcern = getMostSevereVMConcern(vm);
  const conditionsText = !worstConcern ? (
    <>No conditions have been identified that would make this VM a risk to migrate.</>
  ) : worstConcern.category === 'Critical' ? (
    <>
      Conditions have been identified that make this VM a <strong>high risk</strong> to migrate.
    </>
  ) : worstConcern.category === 'Warning' ? (
    <>
      Conditions have been identified that make this VM a <strong>moderate risk</strong> to migrate.
    </>
  ) : worstConcern.category === 'Information' || worstConcern.category === 'Advisory' ? (
    <>Conditions have been identified, but they do not affect the migration risk.</>
  ) : null;
  if (vm.revisionValidated < vm.revision) {
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
              <ListItem key={`${index}-${concern.label}`}>
                <StatusIcon
                  status={getVMConcernStatusType(concern) || StatusType.Warning}
                  label={
                    <>
                      <strong>
                        {getVMConcernStatusLabel(concern)} - {concern.label}:
                      </strong>{' '}
                      {concern.assessment}
                    </>
                  }
                />
              </ListItem>
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
