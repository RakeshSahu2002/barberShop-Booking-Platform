const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();


// =====================================
// CREATE JWT TOKEN
// =====================================

const generateToken = (user) => {

  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );

};

// =====================================
// REGISTER
// =====================================

const register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      phone,
      role
    } = req.body;

    if (!name || !email || !password || !role) {

      return res.status(400).json({

        message:
          "Name, email, password and role are required."

      });

    }

    if (!["customer", "shop_owner"].includes(role)) {

      return res.status(400).json({

        message:
          "Invalid role."

      });

    }

    const existingUser =
      await User.findOne({
        email: email.toLowerCase()
      });

    if (existingUser) {

      return res.status(409).json({

        message:
          "Account already exists."

      });

    }
    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await User.create({

        name,

        email:
          email.toLowerCase(),

        password:
          hashedPassword,

        phone:
          phone || "",

        role

      });

    const token =
      generateToken(user);

    console.log(
      "REGISTER SUCCESS:",
      user.email
    );

    return res.status(201).json({

      message:
        "Registered successfully.",

      token,

      user: {

        id:user._id,

        name:user.name,

        email:user.email,

        role:user.role

      }

    });



  }
  catch(error){


    console.error(
      "REGISTER ERROR:",
      error
    );


    return res.status(500).json({

      message:
        "Server error during registration."

    });


  }


};
// =====================================
// LOGIN
// =====================================

const login = async (req,res)=>{


  try{


    const {
      email,
      password
    } = req.body;


    if(!email || !password){


      return res.status(400).json({

        message:
          "Email and password are required."

      });


    }


    const user =
      await User.findOne({

        email:
          email.toLowerCase()

      });

    console.log(
      "LOGIN EMAIL:",
      email
    );


    console.log(
      "USER FOUND:",
      user ? user.email : null
    );

    if(!user){


      return res.status(401).json({

        message:
          "Invalid email or password."

      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "PASSWORD MATCH:",
      isMatch
    );

    if(!isMatch){


      return res.status(401).json({

        message:
          "Invalid email or password."

      });

    }

    const token =
      generateToken(user);

    return res.json({


      message:
        "Login successful.",

      token,

      user:{

        id:user._id,

        name:user.name,

        email:user.email,

        role:user.role

      }

    });

  }
  catch(error){

    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({

      message:
        "Server error during login."

    });


  }


};

// =====================================
// PROFILE
// =====================================

const getProfile = async(req,res)=>{


 try{


   const user =
    await User.findById(
      req.user.id
    )
    .select(
      "-password"
    );




   if(!user){


    return res.status(404).json({

      message:
        "User not found."

    });


   }




   return res.json(user);



 }
 catch(error){


  console.error(
    "PROFILE ERROR:",
    error
  );


  return res.status(500).json({

    message:
      "Server error."

  });


 }



};







module.exports = {

 register,

 login,

 getProfile

};