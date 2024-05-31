import { initFlowbite } from 'flowbite';

import '../../assets/scss/main.scss';
import { toast } from '../../common/toast';

initFlowbite();

document.getElementById('project_folder_path')!.addEventListener('click', async (e: Event) => {
  e.preventDefault();
  const input = e.target as HTMLInputElement;

  const path = await window.api.projectPanorama.openDirectory();

  if (!path) return;

  input.value = path;
});

document.getElementById('form_setting')!.addEventListener('submit', async (e: Event) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()) as any as {
      project_folder_path: string;
    };

    const isSave = await window.api.setting.setSetting(data as any);

    if (isSave) {
      return toast({
        message: 'Settings saved',
        type: 'success',
      });
    }

    throw new Error('Failed to save settings');
  } catch (error) {
    toast({
      message: 'Failed to save settings',
      type: 'error',
    });
    console.error(error);
  }
});

const preload = async () => {
  const setting = await window.api.setting.getSetting();

  if (!setting) return;

  if (setting.projectFolderPath) (document.getElementById('project_folder_path')! as HTMLInputElement).value = setting.projectFolderPath;
};

preload();
