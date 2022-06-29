import * as React from 'react';
import { Route, RouteComponentProps, Switch, Redirect } from 'react-router-dom';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';
import { useLocalStorageContext, LocalStorageKey } from './common/context/LocalStorageContext';
import { APP_TITLE, ENV } from '@app/common/constants';
import { WelcomePage } from '@app/Welcome/WelcomePage';
import { ProvidersPage } from '@app/Providers/ProvidersPage';
import { PlansPage } from '@app/Plans/PlansPage';
import { MappingsPage } from '@app/Mappings/MappingsPage';
import { HostsPage } from './Providers/HostsPage';
import { PlanWizard } from '@app/Plans/components/Wizard/PlanWizard';
import { VMMigrationDetails } from '@app/Plans/components/VMMigrationDetails';
import { LoginHandlerComponent } from './common/LoginHandlerComponent';
import { RedirectToLogin } from './common/RedirectToLogin';
import { NotFound } from './NotFound';

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
  isLoggedIn?: boolean;
  isProtected: boolean;
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
    isProtected: true,
    // No label property, so it won't be rendered in the nav
  },
  {
    component: LoginHandlerComponent,
    exact: true,
    path: '/handle-login',
    title: `${APP_TITLE} | Login`,
    isProtected: false,
    // No label property, so it won't be rendered in the nav
  },
  {
    component: ProvidersPage,
    exact: true,
    label: 'Providers',
    path: '/providers',
    title: `${APP_TITLE} | Providers`,
    isProtected: true,
  },
  {
    component: ProvidersPage,
    exact: true,
    path: '/providers/:providerType',
    title: `${APP_TITLE} | Providers`,
    isProtected: true,
    // No label property, so it won't be rendered in the nav
  },
  {
    component: HostsPage,
    exact: false,
    path: '/providers/vsphere/:providerName',
    title: `${APP_TITLE} | Hosts`,
    isProtected: true,
  },
  {
    component: PlansPage,
    exact: true,
    label: 'Migration Plans',
    path: '/plans',
    title: `${APP_TITLE} | Migration Plans`,
    isProtected: true,
  },
  {
    component: PlanWizard,
    exact: true,
    path: '/plans/create',
    title: `${APP_TITLE} | Create Migration Plan`,
    isProtected: true,
  },
  {
    component: PlanWizard,
    exact: false,
    path: '/plans/:planName/edit',
    title: `${APP_TITLE} | Edit Migration Plan`,
    isProtected: true,
  },
  {
    component: PlanWizard,
    exact: false,
    path: '/plans/:planName/duplicate',
    title: `${APP_TITLE} | Duplicate Migration Plan`,
    isProtected: true,
  },
  {
    component: VMMigrationDetails,
    exact: false,
    path: '/plans/:planName',
    title: `${APP_TITLE} | Migration Plan Details`,
    isProtected: true,
  },
  {
    component: MappingsPage,
    exact: true,
    label: 'Mappings',
    path: '/mappings',
    title: `${APP_TITLE} | Network and Storage Mappings`,
    isProtected: true,
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
  isLoggedIn,
  isProtected,
  ...rest
}: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    if (isProtected && ENV.NO_AUTH !== 'true') {
      return isLoggedIn ? <Component {...rest} {...routeProps} /> : <RedirectToLogin />;
    } else {
      return <Component {...rest} {...routeProps} />;
    }
  }

  return <Route render={routeWithTitle} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[]
);

export const AppRoutes = (): React.ReactElement => {
  const [isWelcomePageHidden] = useLocalStorageContext(LocalStorageKey.isWelcomePageHidden);
  const [currentUser] = useLocalStorageContext(LocalStorageKey.currentUser);
  return (
    <LastLocationProvider>
      <Switch>
        <Route exact path="/">
          {isWelcomePageHidden ? <Redirect to="/providers" /> : <Redirect to="/welcome" />}
        </Route>
        {flattenedRoutes.map(({ path, exact, component, title, isAsync, isProtected }, idx) => (
          <RouteWithTitleUpdates
            isProtected={isProtected}
            isLoggedIn={!!currentUser || ENV.DATA_SOURCE === 'mock'}
            path={path}
            exact={exact}
            component={component}
            key={idx}
            title={title}
            isAsync={isAsync}
          />
        ))}
        <PageNotFound title="404 Page Not Found" />
      </Switch>
    </LastLocationProvider>
  );
};
