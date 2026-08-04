const mongoose = require("mongoose");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");


const connectDB = async () => {

  try {

    const mongoURL = process.env.MONGODB_URL;


    if (!mongoURL) {

      throw new Error(
        "MONGODB_URL missing in .env file"
      );

    }


    await mongoose.connect(mongoURL, {

      serverSelectionTimeoutMS: 10000,

      socketTimeoutMS: 45000,

    });


    console.log(`
=================================
✅ MongoDB Connected Successfully
=================================
`);


  } catch (error) {


    console.error(`
=================================
❌ MongoDB Connection Failed
=================================

${error.message}

=================================
`);


    process.exit(1);

  }

};


module.exports = connectDB;