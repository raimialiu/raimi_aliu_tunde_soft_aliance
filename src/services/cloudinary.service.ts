import { randomUUID } from "crypto";
import Cloudinary from "cloudinary";
import CloudinaryConfig from "../config/cloudinary.config";
import { FileArray } from "express-fileupload";
import Fs from "fs-extra";
import Application from "../config/app.config";

export default new class CloudinaryService {

  async upload(Body: FileArray) {
    /* Move the file to a temp location */
    const Prefix = randomUUID()
    const Path = `${process.cwd()}/public/${Prefix}-${Body.coverImage['name']}`;

    await Fs.move(Body.coverImage['tempFilePath'], Path);

    Cloudinary.v2.config({
      cloud_name: CloudinaryConfig.CLOUD_NAME,
      api_key: CloudinaryConfig.CLOUD_API_KEY,
      api_secret: CloudinaryConfig.CLOUD_API_SECRET,
      secure: true
    });

    let imagePath = `coachli/test/coverImages/${Body.coverImage['name']}`;
    if (Application.NODE_ENV == 'production') {
      imagePath = `coachli/coverImages/${Body.coverImage['name']}`;
    }

    /* Upload the image to the cloud */
    const CloudImage = await Cloudinary.v2.uploader.upload(Path, { resource_type: 'image', public_id: imagePath, overwrite: true });

    /* Delete the uploaded image */
    Fs.unlink(Path)
      .then((response) => console.log(`Image Deleted Succcessfully!`, response))
      .catch(e => console.log(`Image could not be deleted`, e));

    console.log(`Images Uploaded Successfully!`, CloudImage);

    return CloudImage.url;
  }

}