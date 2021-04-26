import { APP_TITLE, ENV } from '@app/common/constants';
import { APP_BRAND, BrandType } from '@app/global-flags';
import { AboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import * as React from 'react';
import logoForklift from './logoForklift.png';

interface IForkliftAboutModalProps {
  onClose: () => void;
}

const truncateSha = (hash?: string) => hash?.slice(0, 7) || '-';

const versions = [
  ['Toolkit operator version', ENV.FORKLIFT_OPERATOR_VERSION],
  ['Git commit (forklift-controller)', truncateSha(ENV.FORKLIFT_CONTROLLER_GIT_COMMIT)],
  ['Git commit (forklift-must-gather)', truncateSha(ENV.FORKLIFT_MUST_GATHER_GIT_COMMIT)],
  ['Git commit (forklift-operator)', truncateSha(ENV.FORKLIFT_OPERATOR_GIT_COMMIT)],
  ['Git commit (forklift-ui)', truncateSha(ENV.FORKLIFT_UI_GIT_COMMIT)],
  ['Git commit (forklift-validation)', truncateSha(ENV.FORKLIFT_VALIDATION_GIT_COMMIT)],
  ['OpenShift version', ENV.FORKLIFT_CLUSTER_VERSION],
];

const ForkliftAboutModal: React.FunctionComponent<IForkliftAboutModalProps> = ({
  onClose,
}: IForkliftAboutModalProps) => (
  <AboutModal
    isOpen
    onClose={onClose}
    brandImageSrc={APP_BRAND === BrandType.RedHat ? '' : logoForklift}
    brandImageAlt={APP_BRAND === BrandType.RedHat ? '' : 'Forklift Logo'}
    className={APP_BRAND === BrandType.RedHat ? 'brand-redhat' : 'brand-forklift'}
    productName={
      // In the forklift branding, the product name is part of the logo image
      APP_BRAND === BrandType.RedHat ? APP_TITLE : undefined
    }
  >
    <TextContent>
      <TextList component="dl">
        {versions.map((v) => (
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
