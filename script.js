document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('.header');
  const burger = document.querySelector('.burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('.nav__link') : [];
  const desktopRight = document.querySelector('.header .header-right');
  const iframes = document.querySelectorAll('.form-iframe');

  const setHeaderOffset = () => {
    if (!header) return;
    document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight}px`);
  };

  const openMenu = () => {
    if (!burger || !mobileMenu) return;
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    menuOverlay?.classList.add('is-visible');
    body.classList.add('menu-open');
  };

  const closeMenu = () => {
    if (!burger || !mobileMenu) return;
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    menuOverlay?.classList.remove('is-visible');
    body.classList.remove('menu-open');
  };

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    menuOverlay?.addEventListener('click', closeMenu);
    menuLinks.forEach(link => link.addEventListener('click', closeMenu));

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      setHeaderOffset();
      if (window.innerWidth > 991) closeMenu();
    });
  }

  const resizeIframe = (iframe) => {
    if (!iframe) return;
    try {
      const doc = iframe.contentWindow.document;
      const height = Math.max(
        doc.body ? doc.body.scrollHeight : 0,
        doc.documentElement ? doc.documentElement.scrollHeight : 0
      );
      if (height) iframe.style.height = `${height + 8}px`;
    } catch (error) {}
  };

  const refreshIframes = () => {
    iframes.forEach((iframe) => resizeIframe(iframe));
  };

  iframes.forEach((iframe) => {
    iframe.addEventListener('load', () => resizeIframe(iframe));
    setTimeout(() => resizeIframe(iframe), 500);
  });

  let resizeTick;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTick);
    resizeTick = setTimeout(refreshIframes, 150);
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(refreshIframes, 300);
  });

  if (desktopRight && mobileMenu) {
    const syncMenuBlocks = () => {
      const mobileSocials = mobileMenu.querySelector('.mobile-menu__socials');
      const mobileActions = mobileMenu.querySelector('.mobile-menu__actions');
      if (window.innerWidth <= 991) {
        if (mobileSocials && !mobileSocials.dataset.ready) {
          const socials = desktopRight.querySelector('.socials');
          if (socials) mobileSocials.innerHTML = socials.innerHTML;
          mobileSocials.dataset.ready = 'true';
        }
        if (mobileActions && !mobileActions.dataset.ready) {
          const btn = desktopRight.querySelector('.btn');
          if (btn) mobileActions.innerHTML = btn.outerHTML;
          mobileActions.dataset.ready = 'true';
        }
      }
    };
    syncMenuBlocks();
    window.addEventListener('resize', syncMenuBlocks);
  }

  setHeaderOffset();
  window.addEventListener('load', setHeaderOffset);
  window.addEventListener('resize', setHeaderOffset);
});
