export function getImageBuffer(imageBase64: string) {
  // If it contains "data:image/png;base64,...", strip it
  const cleaned = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  return Buffer.from(cleaned, 'base64');
}
