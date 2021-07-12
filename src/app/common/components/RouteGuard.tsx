import * as React from 'react';
import { useHistory } from 'react-router';
import ConfirmModal from '@app/common/components/ConfirmModal';
import { RouteGuardOptions } from '@app/common/constants';
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
  const unBlock = () => RouteGuardOptions.permit;

  React.useEffect(() => {
    if (when) {
      history.block((prompt) => {
        setCurrentPath(prompt.pathname);
        setShowRouteGuard(true);
        return RouteGuardOptions.prevent;
      });
    } else {
      history.block(unBlock());
    }
    return () => {
      history.block(unBlock());
    };
  }, [history, when]);

  const handleOk = React.useCallback(() => {
    history.block(unBlock());
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
