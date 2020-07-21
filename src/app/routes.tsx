import * as React from 'react';
import { Route, RouteComponentProps, Switch, Redirect } from 'react-router-dom';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';
import WelcomePage from '@app/WelcomePage/WelcomePage';
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
    // TODO remove this when we have a providers page
    component: Dashboard,
    exact: true,
    label: 'Dashboard',
    path: '/dashboard',
    title: 'Migration Toolkit for Virtualization | Main Dashboard',
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
            <Redirect to="/dashboard" /> // TODO replace this with /providers
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
