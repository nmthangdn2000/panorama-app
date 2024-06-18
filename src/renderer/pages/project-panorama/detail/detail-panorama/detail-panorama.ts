import { nanoid } from 'nanoid';
import { PanoramaDataType } from '../lib-panorama/panorama.type';
import { destroyViewerPanorama } from '../preview-panorama/preview-panorama';
import { itemImagePanorama } from './html';
import { debounce } from '../../../../common/util';

const btnRemoveAllPanorama = document.getElementById('btn_remove_all_panorama')! as HTMLButtonElement;
const imagePanoramaContainer = document.getElementById('image_panorama_container')! as HTMLDivElement;

const openDialogSelectImages = () => {
  document.getElementById('btn-open-dialog')!.addEventListener('click', async () => {
    const folderPath = await window.api.projectPanorama.selectImages();

    if (!folderPath) return;

    folderPath.forEach((path) => {
      const lastDotIndex = path.name.lastIndexOf('.');

      const d: PanoramaDataType = {
        id: nanoid(),
        title: path.name.substring(0, lastDotIndex),
        pointPosition: { bottom: '50%', left: '50%' },
        cameraPosition: { yaw: 4.720283855981834, pitch: -0.0004923518129509308 },
        subtitle: path.name,
        description: `This is the ${path.name} panorama`,
        image: `file://${path.path}`,
        thumbnail: '1.png',
        markers: [],
        metadata: path.metadata,
        isNew: true,
      };

      window.panoramas.push(d);
    });

    renderListImage();
  });
};

export const renderListImage = () => {
  const sizePanoramas: {
    size: string;
    color: string;
  }[] = [];

  let currentSize = '';

  const isSizeDifference = window.panoramas.some((panorama) => {
    if (!panorama.metadata) return;

    const size = panorama.metadata.width + 'x' + panorama.metadata.height;
    if (!currentSize) {
      currentSize = size;
      return false;
    }

    if (currentSize !== size) {
      return true;
    }

    return false;
  });

  const html = window.panoramas.map((panorama) => {
    if (!panorama.metadata) return;

    let color = 'transparent';
    if (isSizeDifference) {
      const size = panorama.metadata.width + 'x' + panorama.metadata.height;
      const isExist = sizePanoramas.findIndex((sizePanorama) => sizePanorama.size === size);

      if (isExist < 0) {
        color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        sizePanoramas.push({
          size,
          color,
        });
      } else {
        color = sizePanoramas[isExist].color;
      }
    }

    window.onEditTitlePanorama = (element: HTMLButtonElement, id: string) => {
      const title = element.parentElement!.querySelector('h5')!.textContent;

      if (!title) return;

      const input = document.getElementById(`input_title_panorama_${id}`)! as HTMLInputElement;
      input.value = title.trim();

      element.parentElement!.classList.add('hidden');
      input.parentElement!.classList.remove('hidden');
      input.focus({});
    };

    window.onSaveTitlePanorama = (id: string) => {
      const input = document.getElementById(`input_title_panorama_${id}`)! as HTMLInputElement;
      const title = input.value.trim();

      if (!title) return;

      window.panoramas = window.panoramas.map((panorama) => {
        if (panorama.id === id) {
          panorama.title = title;
        }
        return panorama;
      });

      const h5 = input.parentElement!.parentElement!.querySelector('h5')!;

      h5.textContent = title;
      h5.parentElement!.classList.remove('hidden');
      input.parentElement!.classList.add('hidden');

      saveProjectPanorama();
    };

    return itemImagePanorama(panorama.id, panorama.image, panorama.title, panorama.metadata, color);
  });

  imagePanoramaContainer.innerHTML = html.join('');

  const btnPreviewPanorama = document.getElementById('btn_preview_panorama')! as HTMLButtonElement;
  const btnRenderPanorama = document.getElementById('btn_render_panorama')! as HTMLButtonElement;
  const btnExportPanorama = document.getElementById('btn_export_panorama')! as HTMLButtonElement;
  const txtNoPanorama = imagePanoramaContainer.parentElement!.querySelector('p')! as HTMLParagraphElement;
  if (window.panoramas.length > 0) {
    btnRemoveAllPanorama.classList.remove('hidden');
    txtNoPanorama.classList.add('hidden');

    if (isSizeDifference) {
      txtNoPanorama.classList.remove('hidden');
      txtNoPanorama.textContent = 'Panoramas with different sizes are not supported';
    } else {
      btnPreviewPanorama.classList.remove('hidden');
      btnRenderPanorama.classList.remove('hidden');
      btnExportPanorama.classList.remove('hidden');
    }
  } else {
    btnRemoveAllPanorama.classList.add('hidden');
    btnPreviewPanorama.classList.add('hidden');
    btnRenderPanorama.classList.add('hidden');
    btnExportPanorama.classList.add('hidden');
    txtNoPanorama.classList.remove('hidden');
    txtNoPanorama.textContent = 'No images have been added yet.';
  }

  destroyViewerPanorama();
  handleDragAndDropItem();
  saveProjectPanorama();
};

window.onRemovePanorama = (id: string) => {
  const index = window.panoramas.findIndex((panorama) => panorama.id === id);
  if (index < 0) return;

  window.panoramas.splice(index, 1);

  renderListImage();
};

btnRemoveAllPanorama.addEventListener('click', () => {
  window.panoramas = [];

  renderListImage();
});

const handleDragAndDropItem = () => {
  const items = document.querySelectorAll('.item_panorama') as NodeListOf<HTMLElement>;

  items.forEach((item) => {
    const grabItem = item.querySelector('.grab_item_image_panorama')! as HTMLElement;

    // hover
    grabItem.addEventListener('mouseover', () => {
      item.setAttribute('draggable', 'true');
    });

    grabItem.addEventListener('mouseout', () => {
      item.setAttribute('draggable', 'false');
    });

    // grabing
    // grabItem.addEventListener('mousedown', () => {
    //   document.body.style.cursor = 'grabbing';
    // });

    item.addEventListener('dragstart', () => {
      setTimeout(() => {
        item.classList.add('dragging');
      }, 0);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');

      // update panoramas order
      const items = document.querySelectorAll('.item_panorama');

      const newPanoramas: PanoramaDataType[] = [];
      items.forEach((item) => {
        const id = item.getAttribute('data-id')!;
        const panorama = window.panoramas.find((panorama) => panorama.id === id);
        if (panorama) {
          newPanoramas.push(panorama);
        }
      });

      window.panoramas = newPanoramas;

      destroyViewerPanorama();
      saveProjectPanorama();
    });
  });

  imagePanoramaContainer.addEventListener('dragover', initSortableList);
  imagePanoramaContainer.addEventListener('dragenter', (e) => e.preventDefault());
};

const initSortableList = (e: DragEvent) => {
  e.preventDefault();
  const draggingItem = imagePanoramaContainer.querySelector('.dragging')! as HTMLElement;
  // Getting all items except currently dragging and making array of them
  let siblings = [...(imagePanoramaContainer.querySelectorAll('.item_panorama:not(.dragging)') as NodeListOf<HTMLElement>)];

  // Finding the sibling after which the dragging item should be placed
  let nextSibling = siblings.find((sibling) => {
    return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
  });

  // Inserting the dragging item before the found sibling
  imagePanoramaContainer.insertBefore(draggingItem, nextSibling!);
};

/**
 * Save project after working operation
 * @returns {Promise<void>}
 */
export const saveProjectPanorama = () => {
  debounce(() => {
    const url = new URL(window.location.href);
    const name = url.searchParams.get('name');

    if (!name) {
      return;
    }

    window.api.projectPanorama.saveProject(name, {
      panoramas: window.panoramas,
    });

    return;
  }, 1000);
};

export default () => {
  openDialogSelectImages();
  handleDragAndDropItem();
};
