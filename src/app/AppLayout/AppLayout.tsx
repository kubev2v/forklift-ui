import * as React from 'react';
import { NavLink, useRouteMatch, useLocation } from 'react-router-dom';
import {
  Nav,
  NavList,
  NavItem,
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent,
  NavExpandable,
  Title,
  PageHeaderTools,
} from '@patternfly/react-core';
import { routes, IAppRoute, IAppRouteGroup } from '@app/routes';
import { APP_TITLE } from '@app/common/constants';
import logoRedHat from './logoRedHat.svg';
import logoKonveyor from './logoKonveyor.svg';
import { APP_BRAND, BrandType } from '@app/global-flags';
import './AppLayout.css';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const [isMobileView, setIsMobileView] = React.useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = React.useState(false);
  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const location = useLocation();
  const welcomePageMatch = useRouteMatch('/welcome');
  const isNavEnabled = !welcomePageMatch;

  const Header = (
    <PageHeader
      logo={<Title headingLevel="h1">{APP_TITLE}</Title>}
      logoComponent="span"
      showNavToggle={isNavEnabled}
      isNavOpen={isNavEnabled && isNavOpen}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
      headerTools={
        <PageHeaderTools>
          <span
            className="headerBrandLogo"
            dangerouslySetInnerHTML={{
              __html: APP_BRAND === BrandType.RedHat ? logoRedHat : logoKonveyor,
            }}
          />
        </PageHeaderTools>
      }
    />
  );

  const renderNavItem = (route: IAppRoute, index: number) => (
    <NavItem
      key={`${route.label}-${index}`}
      id={`${route.label}-${index}`}
      onClick={isMobileView ? onNavToggleMobile : undefined}
    >
      <NavLink exact to={route.path} activeClassName="pf-m-current">
        {route.label}
      </NavLink>
    </NavItem>
  );

  const renderNavGroup = (group: IAppRouteGroup, groupIndex: number) => (
    <NavExpandable
      key={`${group.label}-${groupIndex}`}
      id={`${group.label}-${groupIndex}`}
      title={group.label}
      isActive={group.routes.some((route) => route.path === location.pathname)}
    >
      {group.routes.map((route, idx) => route.label && renderNavItem(route, idx))}
    </NavExpandable>
  );

  const Navigation = (
    <Nav id="nav-primary-simple" theme="dark">
      <NavList id="nav-list-simple">
        {routes.map(
          (route, idx) =>
            route.label && (!route.routes ? renderNavItem(route, idx) : renderNavGroup(route, idx))
        )}
        {/* TODO restore this after https://github.com/konveyor/virt-ui/issues/281 is settled
        <NavItem onClick={() => window.open(CLOUD_MA_LINK.href, '_blank')}>
          {CLOUD_MA_LINK.label}{' '}
          <ExternalLinkAltIcon className={spacing.mlSm} height="0.8em" width="0.8em" />
        </NavItem>
        */}
      </NavList>
    </Nav>
  );
  const Sidebar = (
    <PageSidebar
      theme="dark"
      nav={Navigation}
      isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
    />
  );
  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">Skip to Content</SkipToContent>
  );
  return (
    <Page
      mainContainerId="primary-app-container"
      header={Header}
      sidebar={isNavEnabled ? Sidebar : null}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}
    >
      {children}
    </Page>
  );
};

export { AppLayout };
