import { hasCondition } from '@app/common/helpers';
import {
  IAnnotatedStorageClass,
  ICorrelatedProvider,
  IOpenShiftProvider,
} from '@app/queries/types';
import { Alert, List, ListItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import * as React from 'react';

interface IOpenShiftStorageClassListProps {
  provider: ICorrelatedProvider<IOpenShiftProvider>;
  storageClasses: IAnnotatedStorageClass[];
}

export const OpenShiftStorageClassList: React.FunctionComponent<IOpenShiftStorageClassListProps> =
  ({ provider, storageClasses }: IOpenShiftStorageClassListProps) => {
    const isProviderReady = hasCondition(provider.status?.conditions || [], 'Ready');
    if (!isProviderReady) {
      return (
        <Alert
          variant="warning"
          isInline
          title="Cannot view storage classes"
          className={spacing.mMd}
        >
          The provider inventory data is not ready
        </Alert>
      );
    }
    return (
      <List className={`provider-storage-classes-list ${spacing.mMd} ${spacing.mlXl}`}>
        {storageClasses.map((storageClass) => (
          <ListItem key={storageClass.name}>{storageClass.name}</ListItem>
        ))}
      </List>
    );
  };
