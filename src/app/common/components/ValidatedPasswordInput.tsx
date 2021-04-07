import * as React from 'react';
import { Button, Popover, TextInputProps } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon, HelpIcon } from '@patternfly/react-icons';
import { IValidatedFormField, ValidatedTextInput } from '@konveyor/lib-ui';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface IValidatedPasswordInputProps {
  field: IValidatedFormField<string> | IValidatedFormField<string | undefined>;
  label: string;
  isRequired?: boolean;
  fieldId: string;
  helpContent?: React.ReactNode;
  helpAriaLabel?: string;
  inputProps?: Partial<TextInputProps>;
}

const ValidatedPasswordInput: React.FunctionComponent<IValidatedPasswordInputProps> = ({
  field,
  label,
  isRequired = false,
  fieldId,
  helpContent = null,
  helpAriaLabel = `More info for ${label} field`,
  inputProps = {},
}: IValidatedPasswordInputProps) => {
  const [isValueVisible, toggleValueVisible] = React.useReducer((isVisible) => !isVisible, false);
  const showHideButton = (
    <Button
      variant="plain"
      onClick={toggleValueVisible}
      aria-label={`Show/hide ${label}`}
      className="pf-c-form__group-label-help"
    >
      {!isValueVisible ? <EyeIcon noVerticalAlign /> : <EyeSlashIcon noVerticalAlign />}
    </Button>
  );
  return (
    <ValidatedTextInput
      field={field}
      type={isValueVisible ? 'text' : 'password'}
      label={label}
      isRequired={isRequired}
      fieldId={fieldId}
      formGroupProps={{
        labelIcon: (
          <>
            {helpContent ? (
              <Popover bodyContent={helpContent}>
                <Button
                  variant="plain"
                  aria-label={helpAriaLabel}
                  onClick={(e) => e.preventDefault()}
                  className={`pf-c-form__group-label-help ${spacing.mrXs}`}
                >
                  <HelpIcon noVerticalAlign />
                </Button>
              </Popover>
            ) : null}
            {showHideButton}
          </>
        ),
      }}
      inputProps={inputProps}
    />
  );
};

export default ValidatedPasswordInput;
