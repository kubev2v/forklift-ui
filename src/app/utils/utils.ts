export function accessibleRouteChangeHandler(pageId = 'primary-app-container') {
  return window.setTimeout(() => {
    const mainContainer = document.getElementById(pageId);
    if (mainContainer) {
      mainContainer.focus();
    }
  }, 50);
}
