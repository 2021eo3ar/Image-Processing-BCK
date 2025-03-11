import sharp from "sharp"

export default processImage = async (imageBuffer) => {
  return await sharp(imageBuffer).resize(300, 300).toBuffer();
};
