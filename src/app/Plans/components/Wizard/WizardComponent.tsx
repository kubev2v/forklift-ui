import * as React from 'react';
import WizardStepContainer from './WizardStepContainer';
import { Wizard } from '@patternfly/react-core';
import Review from './Review';

interface IWizardComponent {
  isOpen: boolean;
  onHandleWizardClose: () => void;
}

const WizardComponent: React.FunctionComponent<IWizardComponent> = ({
  isOpen,
  onHandleWizardClose,
}: IWizardComponent) => {
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
          <div>General</div>
          {/* <GeneralForm vmware={vwmareList} vncList={vncList} isEdit={isEdit} /> */}
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
              <div>Filter VMs</div>
            </WizardStepContainer>
          ),
          enableNext: true,
        },
        {
          id: stepId.SelectVMs,
          name: 'Select VMs',
          component: (
            <WizardStepContainer title="Select VMs">
              <div>Select VMs</div>
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
          <div>Storage mapping</div>
        </WizardStepContainer>
      ),
      enableNext: true,
    },
    {
      id: stepId.NetworkMapping,
      name: 'Network Mapping',
      component: (
        <WizardStepContainer title="Network Mapping">
          <div>Network mapping</div>
        </WizardStepContainer>
      ),
      enableNext: true,
    },
    {
      id: stepId.Hooks,
      name: 'Hooks',
      component: (
        <WizardStepContainer title="Hooks">
          <div>Hooks</div>
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

  const handleClose = () => {
    onHandleWizardClose();
  };

  const onMove = () => {
    return;
  };

  return (
    <Wizard
      title="Create a Migration Plan"
      steps={steps}
      isOpen={isOpen}
      onClose={handleClose}
      onNext={onMove}
      onBack={onMove}
      onSubmit={(event) => event.preventDefault()}
    />
  );
};

export default WizardComponent;
