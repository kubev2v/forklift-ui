import * as React from 'react';
import { useHistory } from 'react-router';
import ConfirmModal from '@app/common/components/ConfirmModal';
import { unBlockRoute } from '@app/common/constants';
interface IRouteGuard {
  when: boolean;
  title: string;
  message: string | JSX.Element;
  okText?: string;
  cancelText?: string;
}

const RouteGuard: React.FunctionComponent<IRouteGuard> = ({
  when,
  title,
  message,
  okText = 'OK',
  cancelText = 'Cancel',
}) => {
  const history = useHistory();
  const [showRouteGuard, setShowRouteGuard] = React.useState(when);
  const [currentPath, setCurrentPath] = React.useState('');

  React.useEffect(() => {
    if (when) {
      history.block((prompt) => {
        setCurrentPath(prompt.pathname);
        setShowRouteGuard(true);
        return false;
      });
    } else {
      history.block(unBlockRoute);
    }
    return () => {
      history.block(unBlockRoute);
    };
  }, [history, when]);

  const handleOk = React.useCallback(() => {
    history.block(unBlockRoute);
    history.push(currentPath);
  }, [currentPath, history]);

  const handleCancel = React.useCallback(() => setShowRouteGuard(false), []);

  return (
    <ConfirmModal
      title={title}
      isOpen={showRouteGuard}
      toggleOpen={handleCancel}
      mutateFn={handleOk}
      cancelButtonText={cancelText}
      confirmButtonText={okText}
      body={message}
    />
  );
};

export { RouteGuard };
