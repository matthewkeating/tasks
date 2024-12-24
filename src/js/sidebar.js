var _sidebarShown = false;

export function showSidebar() {
  window.electronAPI.showSidebar();
  _sidebarShown = true;
}

export function hideSidebar() {
  window.electronAPI.hideSidebar();
  _sidebarShown = false;
}

export function toggleSidebar() {
  if (_sidebarShown) {
    hideSidebar();
  } else {
    showSidebar();
  }
}

export function isShown() {
  return _sidebarShown;
}