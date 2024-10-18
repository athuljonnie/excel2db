const multer = require("multer");
const path = require('path');
const fs = require('fs');
const excelToJson = require('convert-excel-to-json');
const Contact = require("../models/contact");
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
    } else {
        cb(new Error('Only .xlsx files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const handleUploadSuccess = async (file) => {

    const filePath = path.join(file.destination, file.filename);

    const result = excelToJson({
        sourceFile: filePath,
        header: {
            rows: 1
        },
        columnToKey: {
            A: 'companyName',
            B: 'fullName',
            C: 'email'
        }
    });


    for (const sheetName in result) {
        if (result.hasOwnProperty(sheetName)) {
            const contactsArray = result[sheetName] || [];

            const saveContacts = () => {
                return new Promise((resolve, reject) => {
                    try {
                        const contactPromises = contactsArray.map(async row => {
                            if (!row.companyName || !row.fullName || !row.email) {
                                console.log(`Skipping row due to missing data: ${JSON.stringify(row)}`);
                                return Promise.resolve(); 
                            }

                            const existingContact = await Contact.findOne({ contactEmail: row.email });
                            if (existingContact) {
                                console.log(`Contact with email ${row.email} already exists. Skipping.`);
                                return Promise.resolve();
                            }
                            const contact = new Contact();
                            contact.fullName = row.fullName;
                            contact.companyName = row.companyName;
                            contact.designation = "null"; 
                            contact.contactEmail = row.email;
                            contact.contactNumber = "null"; 
                            return contact.save(); 
                        });

                        Promise.all(contactPromises)
                            .then(savedContacts => resolve(savedContacts))
                            .catch(error => reject(error));
                    } catch (error) {
                        reject(error);
                    }
                });
            };

            await saveContacts()
                .then(savedContacts => {
                    console.log(`Contacts saved successfully`);
                })
                .catch(error => {
                    console.error(`Error saving contacts for sheet ${sheetName}:`, error);
                });
        }
    }
};
exports.uploadFile = (req, res) => {
    upload.single('file')(req, res, (error) => {
        if (error) {
            return res.status(500).json({
                message: 'Error uploading file!',
                error: error.message
            });
        }

        if (req.file) {
            handleUploadSuccess(req.file);
            res.status(200).json({
                message: 'File uploaded successfully!',
                file: req.file
            });
        } else {
            res.status(400).json({
                message: 'No file was uploaded!'
            });
        }
    });
};
