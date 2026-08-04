const mongoose = require("mongoose");


const bookingSchema = new mongoose.Schema(
  {

    // Customer who booked
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // Shop where booking is made
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },


    // Selected service
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },


    // Staff/Barber (optional)
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },


    // Customer details snapshot
    customerName: {
      type: String,
      required: true,
      trim: true,
    },


    customerPhone: {
      type: String,
      required: true,
    },


    // Booking date
    bookingDate: {
      type: Date,
      required: true,
    },


    // Booking time slot
    bookingTime: {
      type: String,
      required: true,
    },


    // Amount details

    amount: {
      type: Number,
      required: true,
      default: 0,
    },


    commissionAmount: {
      type: Number,
      default: 0,
    },


    ownerAmount: {
      type: Number,
      default: 0,
    },



    // Booking status

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled",
        "Rejected"
      ],
      default: "Pending",
    },



    // Payment details

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded"
      ],
      default: "Pending",
    },


    paymentId: {
      type: String,
      default: "",
    },


    orderId: {
      type: String,
      default: "",
    },


    signature: {
      type: String,
      default: "",
    },



    // Extra notes

    notes: {
      type: String,
      default: "",
    },


  },
  {
    timestamps: true,
  }
);



// Prevent double booking same slot

bookingSchema.index(
  {
    shop: 1,
    bookingDate: 1,
    bookingTime: 1,
  },
  {
    unique: false,
  }
);



module.exports =
mongoose.model(
  "Booking",
  bookingSchema
);