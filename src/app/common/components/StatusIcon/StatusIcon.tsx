import * as React from 'react';
import {
  CheckCircleIcon,
  WarningTriangleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import classNames from 'classnames';
import './StatusIcon.css';

export enum StatusType {
  Ok = 'Ok',
  Warning = 'Warning',
  Error = 'Error',
}

interface IProps {
  status: StatusType;
  isDisabled?: boolean;
  className?: string;
}

const StatusIcon: React.FunctionComponent<IProps> = ({
  status,
  isDisabled,
  className = '',
}: IProps) => {
  const extraClassNames = classNames({ 'status-icon-disabled': isDisabled }, className);
  if (status === StatusType.Ok) {
    return <CheckCircleIcon className={classNames('status-icon-ok', extraClassNames)} />;
  }
  if (status === StatusType.Warning) {
    return <WarningTriangleIcon className={classNames('status-icon-warning', extraClassNames)} />;
  }
  if (status === StatusType.Error) {
    return <ExclamationCircleIcon className={classNames('status-icon-error', extraClassNames)} />;
  }
  return null;
};

export default StatusIcon;
