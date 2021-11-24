import { PRODUCT_DOCO_LINK } from '@app/common/constants';
import { Dropdown, DropdownToggle, DropdownItem } from '@patternfly/react-core';
import QuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';
import * as React from 'react';
import { ForkliftAboutModal } from './ForkliftAboutModal';

interface IHelpDropdownProps {
  className: string;
}

export const HelpDropdown: React.FunctionComponent<IHelpDropdownProps> = ({
  className,
}: IHelpDropdownProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = React.useState(false);
  return (
    <>
      <Dropdown
        isPlain
        className={className}
        toggle={
          <DropdownToggle
            id="toggle-id"
            toggleIndicator={null}
            onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Help menu"
          >
            <QuestionCircleIcon />
          </DropdownToggle>
        }
        isOpen={isDropdownOpen}
        dropdownItems={[
          <DropdownItem key="docs" href={PRODUCT_DOCO_LINK.href} target="_blank">
            Documentation
          </DropdownItem>,
          <DropdownItem
            key="about"
            component="button"
            onClick={() => {
              setIsAboutModalOpen(true);
              setIsDropdownOpen(false);
            }}
          >
            About
          </DropdownItem>,
        ]}
      />
      {isAboutModalOpen ? <ForkliftAboutModal onClose={() => setIsAboutModalOpen(false)} /> : null}
    </>
  );
};
