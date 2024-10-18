const Contact = require("../models/contact")
const exampleContact = {
    fullName: 'John Doe',
    companyName: 'Tech Solutions',
    designation: 'Manager',
    contactEmail: 'johndoe@example.com',
    contactNumber: '+1234567890'
  };

  const addContact = async (req, res) => {
    const contactData = req.body;
  
    try {
      // Attempt to create a new contact with the data
      const contact = new Contact(contactData);
      const savedContact = await contact.save();
  
      // Respond with success message
      res.status(200).json({ message: "Contact added successfully", data: savedContact });
    } catch (error) {
      // Check if error is a MongoDB duplicate key error (code 11000)
      if (error.code === 11000) {
        // Handle duplicate email error
        res.status(400).json({
          error: "Duplicate key error",
          message: `A contact with the email ${error.keyValue.contactEmail} already exists. Please use a different email.`
        });
      } else {
        // Handle other errors
        console.error("Error adding contact:", error);
        res.status(500).json({ error: "An unexpected error occurred. Please try again." });
      }
    }
  };
  // Example usage




module.exports = {
    addContact,
};
