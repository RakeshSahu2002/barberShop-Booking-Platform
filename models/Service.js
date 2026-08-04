const mongoose = require("mongoose");


const serviceSchema = new mongoose.Schema(
  {

    // Shop owner/shop reference
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },


    // Service name

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


    // Original price

    price: {
      type: Number,
      required: true,
      min: 0,
    },


    // Platform commission percentage

    commission: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },


    // Final customer price

    finalPrice: {
      type: Number,
      default: 0,
    },


    // Service duration in minutes

    duration: {
      type: Number,
      default: 30,
    },


    // Service image

    image: {
      type: String,
      default: "",
    },


    // Active status

    isActive: {
      type: Boolean,
      default: true,
    },


    // Category

    category: {
      type: String,
      default: "Hair",
    },


    // Total bookings

    totalBookings: {
      type: Number,
      default: 0,
    },


  },
  {
    timestamps: true,
  }
);




// Calculate final price automatically

serviceSchema.pre(
  "save",
  function(next){


    const commissionAmount =
      (this.price * this.commission) / 100;


    this.finalPrice =
      this.price + commissionAmount;


    next();


  }
);




// Index for faster search

serviceSchema.index({
  shop:1,
  isActive:1,
});



module.exports =
mongoose.model(
  "Service",
  serviceSchema
);