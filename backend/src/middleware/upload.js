import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination:(req,file,cb) =>{
        const userDir = path.join(process.cwd(), "uploads", req.user.id);
        if(!fs.existsSync(userDir)){
            fs.mkdirSync(userDir, {recursive: true});
        }
    cb(null, userDir);

    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },

});

export const upload = multer({storage});

