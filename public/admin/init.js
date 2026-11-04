(async () => {
  const setup = document.getElementById('setup');
  const status = document.getElementById('editor-status');
  const detail = document.getElementById('setup-detail');
  const launch = async (config) => {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/admin/cms.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('The editor application could not be loaded. Ask the website owner to run the production build again.'));
      document.head.append(script);
    });
    await window.CMS.init({ config: { ...config, load_config_file: false } });
    setup.hidden = true;
  };
  try {
    const response = await fetch('/admin/config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('The editor configuration could not be loaded.');
    const config = await response.json();
    if (config.backend.repo.startsWith('SETUP_REQUIRED/') || config.backend.base_url.includes('setup-required.invalid')) {
      status.textContent = 'The editor needs its one-time account setup.';
      detail.textContent = 'The website owner must connect the GitHub repository and free authentication Worker using DEPLOYMENT.md. Login and publishing are unavailable until those real accounts are connected.';
      if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
        const button = document.createElement('button');
        button.textContent = 'Open local editor';
        button.addEventListener('click', async () => {
          button.disabled = true;
          try { await launch(config); }
          catch (error) { detail.textContent = error.message; button.disabled = false; }
        });
        const localHelp = document.createElement('p');
        localHelp.textContent = 'For local checks in Chrome or Edge, open the editor, choose “Work with Local Repository,” then select the project folder. Local saves do not publish online.';
        setup.append(button, localHelp);
      }
      return;
    }
    // Load the locally bundled CMS only when configured. The build pins its version.
    await launch(config);
  } catch (error) {
    status.textContent = 'The editor is temporarily unavailable.';
    detail.textContent = error instanceof Error ? error.message : 'Ask your advisor for help.';
  }
})();
