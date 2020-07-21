import * as React from 'react';

// TODO this is a candidate for reuse in a common components repo!
// TODO we'd have to parameterize the LocalStorageKeys types, not sure how that would carry down to the consumer

export enum LocalStorageKeys {
  isWelcomePageHidden = 'isWelcomePageHidden',
}

export type LocalStorageValues = { [key in LocalStorageKeys]?: string };
interface ILocalStorageContext {
  storageValues: LocalStorageValues;
  setStorageValues: (newValues: LocalStorageValues) => void;
}

export const LocalStorageContext = React.createContext<ILocalStorageContext>({
  storageValues: {},
  setStorageValues: () => {
    console.error('setStorageValues was called without a LocalStorageContextProvider in the tree');
  },
});

interface ILocalStorageContextProviderProps {
  children: React.ReactNode;
}

const getLocalStorageValues = () =>
  Object.keys(LocalStorageKeys).reduce((values, key) => {
    return { ...values, [key]: window.localStorage.getItem(key) };
  }, {});

export const LocalStorageContextProvider: React.FunctionComponent<ILocalStorageContextProviderProps> = ({
  children,
}: ILocalStorageContextProviderProps) => {
  const [values, setValues] = React.useState<LocalStorageValues>(getLocalStorageValues());

  const setStorageValues = (newValues: LocalStorageValues) => {
    try {
      Object.keys(newValues).forEach((key) => {
        window.localStorage.setItem(key, newValues[key]);
      });
      setValues({ ...values, ...newValues });
    } catch (error) {
      console.error('Failed to update local storage', { newValues, error });
    }
  };

  const initFromStorage = () => {
    setValues(getLocalStorageValues());
  };

  React.useEffect(() => {
    window.addEventListener('storage', initFromStorage);
    initFromStorage();
    return () => {
      window.removeEventListener('storage', initFromStorage);
    };
  }, []);

  return (
    <LocalStorageContext.Provider value={{ storageValues: values, setStorageValues }}>
      {children}
    </LocalStorageContext.Provider>
  );
};
