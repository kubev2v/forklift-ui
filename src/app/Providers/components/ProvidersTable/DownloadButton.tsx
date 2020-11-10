import * as React from 'react';
import { Button, Spinner } from '@patternfly/react-core';
import { useDownloadQuery } from '@app/queries';
import { Provider } from '@app/queries/types';

interface IDownloadButtonProps {
  providers: Provider[];
  setDownload: () => void;
}

const DownloadButton: React.FunctionComponent<IDownloadButtonProps> = ({
  providers,
  setDownload,
}: IDownloadButtonProps) => {
  const [isSpinner, setSpinner] = React.useReducer((isSpinner) => !isSpinner, true);

  const { status, data, error } = useDownloadQuery(providers);
  if (status === 'loading') console.log('Inventory payload: Dowloading');
  else if (status === 'error') {
    console.log(error);
    setSpinner();
    setDownload();
  } else {
    console.log(data);
    setSpinner();
    setDownload();
  }

  return (
    <Button variant="secondary">
      {isSpinner ? (
        <>
          <Spinner size="sm" />
          <span>Dowloading data</span>
        </>
      ) : (
        'Downloaded data'
      )}
    </Button>
  );
};

export default DownloadButton;
