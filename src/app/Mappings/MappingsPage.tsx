import * as React from 'react';
import {
  PageSection,
  Title,
  Level,
  LevelItem,
  Tabs,
  Tab,
  TabTitleText,
} from '@patternfly/react-core';
import { Mapping, MappingType } from '@app/queries/types';
import CreateMappingButton from '@app/Mappings/components/CreateMappingButton';
import AddEditMappingModal from '@app/Mappings/components/AddEditMappingModal';
import Mappings from '@app/Mappings/Mappings';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

const MappingsPage: React.FunctionComponent = () => {
  enum MapType {
    'Network',
    'Storage',
  }

  const [activeTabKey, setActiveTabKey] = React.useState<React.ReactText>(0);
  const [activeMapType, setActiveMapType] = React.useState('Network');

  const handleTabSelect = (event: React.MouseEvent, tabIndex: React.ReactText) => {
    setActiveTabKey(tabIndex);
    setActiveMapType(MapType[tabIndex]);
  };

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  const [mappingBeingEdited, setMappingBeingEdited] = React.useState<Mapping | null>(null);

  const toggleModalAndResetEdit = () => {
    setMappingBeingEdited(null);
    toggleAddEditModal();
  };

  const openEditMappingModal = (mapping: Mapping) => {
    setMappingBeingEdited(mapping);
    toggleAddEditModal();
  };

  return (
    <>
      <PageSection variant="light" className={spacing.pb_0}>
        <Level>
          <LevelItem>
            <Title headingLevel="h1">Mappings</Title>
          </LevelItem>
          <LevelItem>
            <CreateMappingButton
              aria-label={`Create ${activeMapType} mapping`}
              variant="secondary"
              label="Create mapping"
              onClick={toggleModalAndResetEdit}
            />
          </LevelItem>
        </Level>

        <Tabs className={spacing.mtSm} activeKey={activeTabKey} onSelect={handleTabSelect}>
          <Tab eventKey={0} title={<TabTitleText>Network</TabTitleText>} />
          <Tab eventKey={1} title={<TabTitleText>Storage</TabTitleText>} />
        </Tabs>
      </PageSection>

      <PageSection>
        <Mappings
          mappingType={MappingType[activeMapType]}
          key={activeMapType.toLowerCase()}
          toggleModalAndResetEdit={toggleModalAndResetEdit}
          openEditMappingModal={openEditMappingModal}
        />
      </PageSection>

      {isAddEditModalOpen ? (
        <AddEditMappingModal
          title={`${
            !mappingBeingEdited ? 'Create' : 'Edit'
          } ${activeMapType.toLowerCase()} mapping`}
          onClose={toggleModalAndResetEdit}
          mappingType={MappingType[activeMapType]}
          mappingBeingEdited={mappingBeingEdited}
        />
      ) : null}
    </>
  );
};
export { MappingsPage };
