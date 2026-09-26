import api from './api';

export const fileToDataUri = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const uploadFile = async (file, folder = 'skillsphere') => {
  const dataUri = await fileToDataUri(file);
  const response = await api.post('/uploads', {
    dataUri,
    folder,
    resourceType: 'auto',
  });
  return response.data.data;
};
