import { initFlowbite, initDropdowns } from 'flowbite';
import { Modal } from 'flowbite';
import { itemProjectPanorama } from './html';
import slugify from 'slugify';

initFlowbite();

const getProjects = async (modalNotificationRemoveProject: Modal) => {
  const listProjectPanoramaElement = document.getElementById('list_project_panorama')! as HTMLDivElement;

  const projects = await window.api.projectPanorama.getProjects();

  listProjectPanoramaElement.querySelector('div')!.innerHTML = '';

  if (projects && projects.length > 0) {
    const html = projects.map((project) => {
      const slugName = slugify(project.name, { lower: true });
      return itemProjectPanorama(project, slugName);
    });

    listProjectPanoramaElement.querySelector('p')!.classList.add('hidden');
    listProjectPanoramaElement.querySelector('div')!.innerHTML = html.join('');

    initDropdowns();

    projects.forEach((project) => {
      const slugName = slugify(project.name, { lower: true });
      const btnExport = document.getElementById(`btn_export_${slugName}`)! as HTMLButtonElement;
      const btnDelete = document.getElementById(`btn_delete_${slugName}`)! as HTMLButtonElement;

      btnExport.addEventListener('click', () => {
        // window.api.projectPanorama.exportProject(project);
      });

      btnDelete.addEventListener('click', async () => {
        // const isDelete = await window.api.projectPanorama.deleteProject(project);
        window.projectRemove = project;
        modalNotificationRemoveProject.show();
      });
    });
  } else {
    listProjectPanoramaElement.querySelector('p')!.classList.remove('hidden');
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  const newProjectModalElement = document.getElementById('new_project_modal')! as HTMLButtonElement;
  const formAddProjectPanorama = document.getElementById('form_add_project_panorama')! as HTMLFormElement;
  const inputAvatarProject = document.getElementById('input_avatar_project')! as HTMLInputElement;
  const imgAvatarProject = document.getElementById('img_avatar_project')! as HTMLImageElement;
  const newProjectModal = new Modal(newProjectModalElement);
  const modalNotificationRemoveProject = new Modal(document.getElementById('modal_notification_remove_project')!);
  const btnAgreeRemoveProject = document.getElementById('btn_agree_remove_project')! as HTMLButtonElement;
  const btnAddProjectPanorama = document.getElementById('btn_add_project_panorama')! as HTMLButtonElement;

  await getProjects(modalNotificationRemoveProject);

  btnAddProjectPanorama.addEventListener('click', () => {
    newProjectModal.show();
  });

  inputAvatarProject.addEventListener('change', function () {
    const file = this.files![0];
    const reader = new FileReader();

    reader.onload = function (e) {
      imgAvatarProject.src = e.target!.result as string;
      imgAvatarProject.removeAttribute('hidden');
    };

    reader.readAsDataURL(file);
  });

  btnAgreeRemoveProject.addEventListener('click', async () => {
    if (!window.projectRemove) return;

    const isDelete = await window.api.projectPanorama.deleteProject(window.projectRemove.name);

    if (isDelete) {
      console.log('Deleted');
      await getProjects(modalNotificationRemoveProject);
    }
  });

  formAddProjectPanorama.addEventListener('submit', async function (event) {
    event.preventDefault();
    // get data from form
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries()) as any as {
      name: string;
      avatar: File;
      description?: string;
    };

    if (!data['name']) {
      return;
    }

    const path = await window.api.projectPanorama.newProject({
      name: data.name as string,
      description: data.description || '',
      avatar: {
        name: data.avatar.name,
        path: data.avatar.path,
      },
    });

    if (path) {
      newProjectModal.hide();
    }

    await getProjects(modalNotificationRemoveProject);
  });
});
