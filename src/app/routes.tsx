import * as React from 'react';
import { Route, RouteComponentProps, Switch, Redirect } from 'react-router-dom';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';
import WelcomePage from '@app/WelcomePage/WelcomePage';
import ProvidersPage from '@app/ProvidersPage/ProvidersPage';
import { LocalStorageContext } from './common/context/LocalStorageContext';

let routeFocusTimer: number;

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
}

export const routes: IAppRoute[] = [
  {
    component: ProvidersPage,
    exact: true,
    label: 'Providers',
    path: '/providers',
    title: 'Migration Toolkit for Virtualization | Providers',
  },
  {
    component: WelcomePage,
    exact: true,
    path: '/welcome',
    title: 'Migration Toolkit for Virtualization | Welcome',
  },
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  const lastNavigation = useLastLocation();
  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync, lastNavigation]);
};

const RouteWithTitleUpdates = ({
  component: Component,
  isAsync = false,
  title,
  ...rest
}: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} />;
};

export const AppRoutes = (): React.ReactElement => {
  const { storageValues } = React.useContext(LocalStorageContext);
  return (
    <LastLocationProvider>
      <Switch>
        <Route exact path="/">
          {storageValues.isWelcomePageHidden ? (
            <Redirect to="/providers" />
          ) : (
            <Redirect to="/welcome" />
          )}
        </Route>
        {routes.map(({ path, exact, component, title, isAsync }, idx) => (
          <RouteWithTitleUpdates
            path={path}
            exact={exact}
            component={component}
            key={idx}
            title={title}
            isAsync={isAsync}
          />
        ))}
        <Redirect to="/" />
      </Switch>
    </LastLocationProvider>
  );
};
