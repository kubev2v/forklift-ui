import * as React from 'react';
import WizardStepContainer from './WizardStepContainer';
import { Wizard } from '@patternfly/react-core';

import Review from './Review';
import GeneralForm from './GeneralForm';
import { Provider } from '@app/Providers/types';
import NetworkMapping from './NetworkMapping';
import { MOCK_NETWORK_MAPPINGS } from '@app/Mappings/Network/mocks/network_mappings.mock.ts';

interface IPlanWizardProps {
  isOpen: boolean;
  onClose: () => void;
  sourceProviders: Provider[];
  targetProviders: Provider[];
}

const PlanWizard: React.FunctionComponent<IPlanWizardProps> = ({
  isOpen,
  onClose,
  sourceProviders,
  targetProviders,
}: IPlanWizardProps) => {
  enum stepId {
    General = 1,
    FilterVMs,
    SelectVMs,
    StorageMapping,
    NetworkMapping,
    Hooks,
    Review,
  }

  const steps = [
    {
      id: stepId.General,
      name: 'General',
      component: (
        <WizardStepContainer title="General Settings">
          <GeneralForm sourceProviders={sourceProviders} targetProviders={targetProviders} />
        </WizardStepContainer>
      ),
      enableNext: true,
    },
    {
      name: 'VM Selection',
      steps: [
        {
          id: stepId.FilterVMs,
          name: 'Filter VMs',
          component: (
            <WizardStepContainer title="Filter VMs">
              <div>TODO: Filter VMs</div>
            </WizardStepContainer>
          ),
          enableNext: true,
        },
        {
          id: stepId.SelectVMs,
          name: 'Select VMs',
          component: (
            <WizardStepContainer title="Select VMs">
              <div>TODO: Select VMs</div>
            </WizardStepContainer>
          ),
          enableNext: true,
        },
      ],
    },
    {
      id: stepId.StorageMapping,
      name: 'Storage Mapping',
      component: (
        <WizardStepContainer title="Storage Mapping">
          <div>TODO: Storage mapping</div>
        </WizardStepContainer>
      ),
      enableNext: true,
    },
    {
      id: stepId.NetworkMapping,
      name: 'Network Mapping',
      component: (
        <WizardStepContainer title="Network Mapping">
          <NetworkMapping networkMappingList={MOCK_NETWORK_MAPPINGS} />
        </WizardStepContainer>
      ),
      enableNext: true,
    },
    {
      id: stepId.Hooks,
      name: 'Hooks',
      component: (
        <WizardStepContainer title="Hooks">
          <div>TODO: Hooks</div>
        </WizardStepContainer>
      ),
      enableNext: true,
    },
    {
      id: stepId.Review,
      name: 'Review',
      component: <Review />,
      nextButtonText: 'Finish',
    },
  ];

  const onMove = () => {
    return;
  };

  return (
    <Wizard
      title="Create a Migration Plan"
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      onNext={onMove}
      onBack={onMove}
      onSubmit={(event) => event.preventDefault()}
    />
  );
};

export default PlanWizard;
