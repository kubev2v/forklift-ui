import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  PageSection,
  Title,
  Bullseye,
  Flex,
  FlexItem,
  Text,
  TextContent,
  List,
  ListItem,
  Button,
  Checkbox,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import flex from '@patternfly/react-styles/css/utilities/Flex/flex';
import logoMA from '@app/common/logoMA.svg';

const isHideWelcomeScreen = false;

const WelcomePage: React.FunctionComponent = () => (
  <PageSection>
    <Bullseye>
      <Flex className={`${flex.alignItemsCenter} ${flex.flexDirectionColumn}`}>
        <FlexItem>
          <span dangerouslySetInnerHTML={{ __html: logoMA }} />
        </FlexItem>
        <FlexItem>
          <Title
            headingLevel="h1"
            size="4xl"
            className={`${alignment.textAlignCenter} ${spacing.myXl}`}
          >
            Welcome to Migration Toolkit for Virtualization
          </Title>
        </FlexItem>
        <FlexItem>
          <TextContent>
            <Text component="p">
              Migrating workloads to OpenShift Virtualization is a multi-step process.
            </Text>
            <List component="ol">
              <ListItem>Add source and target providers for the migration.</ListItem>
              <ListItem>
                Map source datastores and networks to target storage classes and networks.
              </ListItem>
              <ListItem>
                Create a migration plan and select VMs from the source provider for migration.
              </ListItem>
              <ListItem>Run the migration plan.</ListItem>
            </List>
          </TextContent>
        </FlexItem>
        <FlexItem className={`${spacing.myLg}`}>
          <Link
            to="/providers"
            component={React.forwardRef((_props, ref) => (
              <Button
                ref={ref as React.ClassAttributes<HTMLButtonElement>['ref']}
                variant="primary"
              >
                Get started
              </Button>
            ))}
          />
        </FlexItem>
        <FlexItem className={`${spacing.myLg}`}>
          <Checkbox
            label="Don't show this page again."
            aria-label="show-page"
            id="show-page-checkbox"
            isChecked={isHideWelcomeScreen}
            onChange={(checked: boolean) => {
              alert('TODO');
            }}
          />
        </FlexItem>
      </Flex>
    </Bullseye>
  </PageSection>
);

export default WelcomePage;
