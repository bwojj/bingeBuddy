/* Device chrome + icons for all gallery pages */
(function () {
  function statusIcons() {
    return (
      '<span class="sbicons">' +
      '<svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor"><rect x="0" y="9" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="7" rx="1"/><rect x="10" y="3" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="13" rx="1"/></svg>' +
      '<svg width="17" height="13" viewBox="0 0 17 13" fill="currentColor"><path d="M8.5 2C5.6 2 3 3.1 1 4.9l1.4 1.5C4 4.9 6.1 4 8.5 4s4.5.9 6.1 2.4L16 4.9C14 3.1 11.4 2 8.5 2z"/><path d="M8.5 6.2c-1.7 0-3.3.6-4.5 1.7l1.5 1.5c.8-.7 1.9-1.2 3-1.2s2.2.5 3 1.2l1.5-1.5C11.8 6.8 10.2 6.2 8.5 6.2z"/><circle cx="8.5" cy="11" r="1.6"/></svg>' +
      '<svg width="25" height="13" viewBox="0 0 25 13" fill="none"><rect x="0.5" y="0.5" width="21" height="12" rx="3.5" stroke="currentColor" stroke-opacity="0.45"/><rect x="2" y="2" width="16.5" height="9" rx="2" fill="currentColor"/><rect x="23.2" y="4.2" width="1.5" height="4.6" rx="0.75" fill="currentColor" fill-opacity="0.5"/></svg>' +
      '</span>'
    );
  }
  document.querySelectorAll('.phone__screen').forEach(function (s) {
    if (!s.querySelector('.island')) s.insertAdjacentHTML('afterbegin', '<div class="island"></div>');
    if (!s.querySelector('.home-ind')) {
      var light = s.getAttribute('data-ind') === 'light';
      s.insertAdjacentHTML('beforeend', '<div class="home-ind' + (light ? ' light' : '') + '"></div>');
    }
  });
  document.querySelectorAll('.statusbar').forEach(function (sb) {
    if (!sb.querySelector('.sbicons')) sb.insertAdjacentHTML('beforeend', statusIcons());
  });
  if (window.lucide) lucide.createIcons();
})();
