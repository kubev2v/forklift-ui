import * as React from 'react';
import { Modal, Wizard } from '@patternfly/react-core';
import WizardStepContainer from './WizardStepContainer';
import GeneralForm from './GeneralForm';
import FilterVMs from './FilterVMs';
import SelectVMs from './SelectVMs';
import Review from './Review';
import { Provider } from '@app/Providers/types';
import { MOCK_VMS } from './mocks/VMs.mock';

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
              <FilterVMs Inventory={[]} />
            </WizardStepContainer>
          ),
          enableNext: true,
        },
        {
          id: stepId.SelectVMs,
          name: 'Select VMs',
          component: (
            <WizardStepContainer title="Select VMs">
              <SelectVMs vms={MOCK_VMS} />
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
          <div>TODO: Network mapping</div>
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
    <Modal isOpen={isOpen} width="95%" showClose={false} hasNoBodyWrapper>
      <Wizard
        title="Create a Migration Plan"
        steps={steps}
        onClose={onClose}
        onNext={onMove}
        onBack={onMove}
        onSubmit={(event) => event.preventDefault()}
      />
    </Modal>
  );
};

export default PlanWizard;
