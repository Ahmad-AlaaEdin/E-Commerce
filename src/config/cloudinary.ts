
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadFromBuffer = (buffer:Buffer, folder:string) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err || !result) return reject(err || new Error('No result from Cloudinary'));
      resolve(result.secure_url); 
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export default uploadFromBuffer ;
