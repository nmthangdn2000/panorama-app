const exportProject = () => {
  const btnRenderPanorama = document.getElementById('btn_render_panorama')! as HTMLButtonElement;
  btnRenderPanorama.addEventListener('click', async () => {
    const url = new URL(window.location.href);
    const name = url.searchParams.get('name');
    console.log(name);

    const result = await window.api.projectPanorama.exportProject(name, {
      panoramas: window.panoramas,
      panoramasImport: window.panoramasImport,
    });

    console.log(result);
  });
};

export default () => {
  exportProject();
};
