const mongoose = require("mongoose");


const paymentSchema = new mongoose.Schema(
  {

    // User who made payment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // Related booking
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },


    // Shop owner
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },


    // Payment amount
    amount: {
      type: Number,
      required: true,
      default: 0,
    },


    // Payment gateway details

    razorpayOrderId: {
      type: String,
      default: "",
    },


    razorpayPaymentId: {
      type: String,
      default: "",
    },


    razorpaySignature: {
      type: String,
      default: "",
    },



    // Payment method

    method: {
      type: String,
      enum: [
        "UPI",
        "Card",
        "NetBanking",
        "Wallet",
        "Cash"
      ],
      default: "UPI",
    },



    // Payment status

    status: {
      type: String,
      enum: [
        "Pending",
        "Success",
        "Failed",
        "Refunded"
      ],
      default: "Pending",
    },



    // UPI details (optional)

    upiId: {
      type: String,
      default: "",
    },


    transactionId: {
      type: String,
      default: "",
    },


    failureReason: {
      type: String,
      default: "",
    },


  },
  {
    timestamps: true,
  }
);



// Search optimization

paymentSchema.index({
  user: 1,
  booking: 1,
  status: 1,
});


module.exports =
mongoose.model(
  "Payment",
  paymentSchema
);