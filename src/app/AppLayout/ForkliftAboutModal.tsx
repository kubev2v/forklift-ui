import { APP_TITLE } from '@app/common/constants';
import { APP_BRAND, BrandType } from '@app/global-flags';
import { AboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import * as React from 'react';
import logoForklift from './logoForklift.png';
import iconRedHat from './iconRedHat.png';

interface IForkliftAboutModalProps {
  onClose: () => void;
}

const envVars = [
  ['FORKLIFT_CONTROLLER_GIT_COMMIT', process.env.FORKLIFT_CONTROLLER_GIT_COMMIT],
  ['FORKLIFT_MUST_GATHER_GIT_COMMIT', process.env.FORKLIFT_MUST_GATHER_GIT_COMMIT],
  ['FORKLIFT_OPERATOR_GIT_COMMIT', process.env.FORKLIFT_OPERATOR_GIT_COMMIT],
  ['FORKLIFT_UI_GIT_COMMIT', process.env.FORKLIFT_UI_GIT_COMMIT],
  ['FORKLIFT_VALIDATION_GIT_COMMIT', process.env.FORKLIFT_VALIDATION_GIT_COMMIT],
];

const ForkliftAboutModal: React.FunctionComponent<IForkliftAboutModalProps> = ({
  onClose,
}: IForkliftAboutModalProps) => (
  <AboutModal
    isOpen
    onClose={onClose}
    brandImageSrc={APP_BRAND === BrandType.RedHat ? iconRedHat : logoForklift}
    className={APP_BRAND === BrandType.RedHat ? 'brand-redhat' : 'brand-forklift'}
    brandImageAlt={`${APP_BRAND === BrandType.RedHat ? 'Red Hat' : 'Forklift'} Logo`}
    productName={
      // In the forklift branding, the product name is part of the logo image
      APP_BRAND === BrandType.RedHat ? APP_TITLE : undefined
    }
  >
    <TextContent>
      <TextList component="dl">
        {envVars.map((v) => (
          <React.Fragment key={v[0]}>
            <TextListItem component="dt">{v[0]}</TextListItem>
            <TextListItem component="dd">{v[1]}</TextListItem>
          </React.Fragment>
        ))}
      </TextList>
    </TextContent>
  </AboutModal>
);

export default ForkliftAboutModal;
