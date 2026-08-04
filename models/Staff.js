const mongoose = require("mongoose");


const staffSchema = new mongoose.Schema(
  {

    // Shop owner/shop reference

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },


    // Staff name

    name: {
      type: String,
      required: true,
      trim: true,
    },


    // Phone number

    phone: {
      type: String,
      required: true,
    },


    // Email (optional)

    email: {
      type: String,
      default: "",
      lowercase: true,
    },



    // Profile image

    image: {
      type: String,
      default: "",
    },



    // Staff role

    role: {

      type: String,

      enum:[
        "barber",
        "manager",
        "assistant"
      ],

      default:"barber"

    },



    // Skills

    skills: [

      {
        type:String
      }

    ],



    // Experience in years

    experience: {

      type:Number,

      default:0

    },



    // Gender

    gender: {

      type:String,

      enum:[
        "male",
        "female",
        "other"
      ],

      default:"male"

    },



    // Working status

    isAvailable: {

      type:Boolean,

      default:true

    },

    // Joining date

    joiningDate: {

      type:Date,

      default:Date.now

    },

    // Salary details

    salaryType: {

      type:String,

      enum:[
        "monthly",
        "commission",
        "daily"
      ],

      default:"commission"

    },


    salaryAmount: {

      type:Number,

      default:0

    },

    // Total completed bookings

    totalBookings: {

      type:Number,

      default:0

    },

    // Staff rating

    rating: {

      average: {

        type:Number,

        default:0

      },


      totalReviews: {

        type:Number,

        default:0

      }

    },

    // Active / Deleted status

    status: {

      type:String,

      enum:[
        "active",
        "inactive"
      ],

      default:"active"

    }


  },
  {
    timestamps:true
  }
);

// Search optimization

staffSchema.index({

  shop:1,

  status:1

});

module.exports =
mongoose.model(
  "Staff",
  staffSchema
);