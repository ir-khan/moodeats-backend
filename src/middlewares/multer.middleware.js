import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/tmp/");
    },
    filename: function (req, file, cb) {
        // console.log("File uploaded by user:", file);
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });
export default upload;





// const createMulterUpload = (folder) => {
//     const storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//             cb(null, `./public/${folder}`);
//         },
//         filename: function (req, file, cb) {
//             // console.log("File uploaded by user:", file);
//             cb(null, `${Date.now()}${path.extname(file.originalname)}`);
//         },
//     });

//     const upload = multer({ storage });
//     return upload;
// };

// export default createMulterUpload;
