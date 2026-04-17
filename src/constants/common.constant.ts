export enum KEY_IPC {
  // project panorama
  OPEN_DIRECTORY = 'dialog:openDirectory',
  OPEN_DIALOG_SELECT_IMAGES = 'dialog:openDialogSelectImages',
  NEW_PROJECT = 'project:new',
  GET_PROJECTS = 'project:getProjects',
  GET_PROJECT = 'project:get',
  DELETE_PROJECT = 'project:delete',
  EXPORT_PROJECT = 'project:export',
  RENDER_PROJECT = 'project:render',
  PROCESSING_PROJECT = 'project:processing',
  CANCEL_PROCESSING_PROJECT = 'project:cancelProcessing',
  SAVE_PROJECT = 'project:save',

  // settings
  GET_SETTINGS = 'settings:get',
  SET_SETTINGS = 'settings:set',

  // image compressor
  IMAGE_COMPRESSOR_SELECT_IMAGES = 'imageCompressor:selectImages',
  IMAGE_COMPRESSOR_SELECT_FOLDER = 'imageCompressor:selectFolder',
  IMAGE_COMPRESSOR_SELECT_OUTPUT_FOLDER = 'imageCompressor:selectOutputFolder',
  IMAGE_COMPRESSOR_COMPRESS = 'imageCompressor:compress',
  IMAGE_COMPRESSOR_PROGRESS = 'imageCompressor:progress',
  IMAGE_COMPRESSOR_CANCEL = 'imageCompressor:cancel',

  // image resizer
  IMAGE_RESIZER_SELECT_IMAGES = 'imageResizer:selectImages',
  IMAGE_RESIZER_SELECT_FOLDER = 'imageResizer:selectFolder',
  IMAGE_RESIZER_SELECT_OUTPUT_FOLDER = 'imageResizer:selectOutputFolder',
  IMAGE_RESIZER_RESIZE = 'imageResizer:resize',
  IMAGE_RESIZER_PROGRESS = 'imageResizer:progress',
  IMAGE_RESIZER_CANCEL = 'imageResizer:cancel',
}
