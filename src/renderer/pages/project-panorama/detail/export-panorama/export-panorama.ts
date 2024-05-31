import { toast } from '../../../../common/toast';

const btnExportPanorama = document.getElementById('btn_export_panorama')! as HTMLButtonElement;

const exportPanorama = () => {
  btnExportPanorama.addEventListener('click', async () => {
    const pathFolder = await window.api.projectPanorama.openDirectory();
    if (!pathFolder) return;

    const url = new URL(window.location.href);
    const name = url.searchParams.get('name');

    if (!name) {
      return;
    }

    const exporting = await window.api.projectPanorama.exportProject(name, pathFolder);

    if (exporting) {
      toast({
        message: 'Project exported',
        type: 'success',
      });
    }
  });
};

export default () => {
  exportPanorama();
};
