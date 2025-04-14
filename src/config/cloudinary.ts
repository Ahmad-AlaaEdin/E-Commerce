import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

class Cloudinary {
  private folders = {
    users: "e-commerce/users",
    products: "e-commerce/products",
  };

  async uploadImage(file: string, type: "users" | "products") {
    const result = await cloudinary.uploader.upload(file, {
      folder: this.folders[type],
    });
    return result;
  }

  async uploadMultipleImages(
    files: string[],
    type: "users" | "products" = "products"
  ) {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file, type));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      throw error;
    }
  }
}
