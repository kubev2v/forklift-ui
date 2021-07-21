import * as React from 'react';
import { useHistory } from 'react-router';
import { UnregisterCallback } from 'history';
import ConfirmModal from '@app/common/components/ConfirmModal';

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

  const unblockFnRef = React.useRef<UnregisterCallback | null>(null);
  const unblock = () => {
    if (unblockFnRef.current) {
      unblockFnRef.current();
      unblockFnRef.current = null;
    }
  };

  React.useEffect(() => {
    if (when) {
      unblockFnRef.current = history.block((prompt) => {
        setCurrentPath(prompt.pathname);
        setShowRouteGuard(true);
        return false;
      });
    }
    return unblock;
  }, [history, when]);

  const handleOk = React.useCallback(() => {
    unblock();
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
