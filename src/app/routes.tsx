import * as React from 'react';
import { Route, RouteComponentProps, Switch, Redirect } from 'react-router-dom';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';
import { useLocalStorageContext, LocalStorageKey } from './common/context/LocalStorageContext';
import { APP_TITLE } from '@app/common/constants';
import WelcomePage from '@app/Welcome/WelcomePage';
import ProvidersPage from '@app/Providers/ProvidersPage';
import PlansPage from '@app/Plans/PlansPage';
import NetworkMappingsPage from '@app/Mappings/Network/NetworkMappingsPage';
import StorageMappingsPage from '@app/Mappings/Storage/StorageMappingsPage';
import HooksPage from '@app/Hooks/HooksPage';
import { HostsPage } from './Providers/HostsPage';
import PlanWizard from '@app/Plans/components/Wizard/PlanWizard';
import VMMigrationDetails from '@app/Plans/components/VMMigrationDetails';

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
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

export const routes: AppRouteConfig[] = [
  {
    component: WelcomePage,
    exact: true,
    path: '/welcome',
    title: `${APP_TITLE} | Welcome`,
    // No label property, so it won't be rendered in the nav
  },
  {
    component: ProvidersPage,
    exact: true,
    label: 'Providers',
    path: '/providers',
    title: `${APP_TITLE} | Providers`,
  },
  {
    component: HostsPage,
    exact: false,
    path: '/providers/:providerId',
    title: `${APP_TITLE} | Hosts`,
  },
  {
    component: PlansPage,
    exact: true,
    label: 'Migration Plans',
    path: '/plans',
    title: `${APP_TITLE} | Migration Plans`,
  },
  {
    component: PlanWizard,
    exact: true,
    path: '/plans/create',
    title: `${APP_TITLE} | Create Migration Plan`,
  },
  {
    component: VMMigrationDetails,
    exact: false,
    path: '/plans/:planId',
    title: `${APP_TITLE} | Migration Plan Details`,
  },
  {
    label: 'Mappings',
    routes: [
      {
        component: NetworkMappingsPage,
        exact: true,
        label: 'Network',
        path: '/mappings/network',
        title: `${APP_TITLE} | Network Mappings`,
      },
      {
        component: StorageMappingsPage,
        exact: true,
        label: 'Storage',
        path: '/mappings/storage',
        title: `${APP_TITLE} | Storage Mappings`,
      },
    ],
  },
  {
    component: HooksPage,
    exact: true,
    label: 'Hooks',
    path: '/hooks',
    title: `${APP_TITLE} | Hooks`,
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

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[]
);

export const AppRoutes = (): React.ReactElement => {
  const [isWelcomePageHidden] = useLocalStorageContext(LocalStorageKey.isWelcomePageHidden);
  return (
    <LastLocationProvider>
      <Switch>
        <Route exact path="/">
          {isWelcomePageHidden ? <Redirect to="/providers" /> : <Redirect to="/welcome" />}
        </Route>
        {flattenedRoutes.map(({ path, exact, component, title, isAsync }, idx) => (
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
