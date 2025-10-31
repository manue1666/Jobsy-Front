export const getImageSource = (imageUri: string | any) => {
  // Si es un objeto (ya es require()), devolverlo directamente
  if (typeof imageUri === 'object') {
    return imageUri;
  }
  
  // Si es string y comienza con http, es URL remota
  if (typeof imageUri === 'string' && imageUri.startsWith('http')) {
    return { uri: imageUri };
  }
  
  // Si es la ruta de la imagen default local
  if (typeof imageUri === 'string' && imageUri.includes('service_default_image')) {
    return require('@/assets/images/service_default_image.png');
  }
  
  // Por defecto, tratar como URI remota
  return { uri: imageUri };
};