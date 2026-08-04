const mongoose = require("mongoose");


const shopSchema = new mongoose.Schema(
  {

    // Shop Owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // Shop Name

    name: {
      type: String,
      required: true,
      trim: true,
    },


    // Description

    description: {
      type: String,
      default: "",
      trim: true,
    },


    // Contact Details

    phone: {
      type: String,
      required: true,
    },


    email: {
      type: String,
      default: "",
    },



    // Shop Address

    address: {

      street: {
        type: String,
        default: "",
      },


      city: {
        type: String,
        default: "",
      },


      state: {
        type: String,
        default: "",
      },


      pincode: {
        type: String,
        default: "",
      },


    },



    // Location

    location: {

      latitude: {
        type: Number,
        default: 0,
      },


      longitude: {
        type: Number,
        default: 0,
      },


    },



    // Shop Images

    images: [
      {
        type: String,
      }
    ],



    // Services category

    category: {

      type: String,

      default: "Barber Shop"

    },



    // Approval Status

    status: {

      type: String,

      enum:[
        "pending",
        "approved",
        "rejected"
      ],

      default:"pending"

    },



    // Open / Close

    isOpen: {

      type:Boolean,

      default:true

    },



    // Opening timings

    timings: {

      monday:{
        open:String,
        close:String
      },

      tuesday:{
        open:String,
        close:String
      },

      wednesday:{
        open:String,
        close:String
      },

      thursday:{
        open:String,
        close:String
      },

      friday:{
        open:String,
        close:String
      },

      saturday:{
        open:String,
        close:String
      },

      sunday:{
        open:String,
        close:String
      }

    },



    // Rating

    rating: {

      average:{

        type:Number,

        default:0

      },


      totalReviews:{

        type:Number,

        default:0

      }

    },



    // Earnings

    earnings: {

      totalBookings:{

        type:Number,

        default:0

      },


      totalRevenue:{

        type:Number,

        default:0

      },


      commissionPaid:{

        type:Number,

        default:0

      },


      ownerRevenue:{

        type:Number,

        default:0

      }

    },



    // Verification

    isVerified:{

      type:Boolean,

      default:false

    }


  },
  {
    timestamps:true
  }
);



// Search optimization

shopSchema.index({
  "address.city":1,
  status:1,
  owner:1
});



module.exports =
mongoose.model(
  "Shop",
  shopSchema
);