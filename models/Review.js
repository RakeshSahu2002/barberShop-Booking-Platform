const mongoose = require("mongoose");


const reviewSchema = new mongoose.Schema(
  {

    // Customer who gave review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // Shop review belongs to
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },


    // Booking reference (optional)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },


    // Rating

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },


    // Review message

    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },


    // Owner reply

    reply: {
      type: String,
      default: "",
      maxlength: 500,
    },


    // Review status

    status: {
      type: String,
      enum: [
        "active",
        "hidden",
        "reported"
      ],
      default: "active",
    },


    // Like count

    likes: {
      type: Number,
      default: 0,
    },


  },
  {
    timestamps: true,
  }
);



// Prevent duplicate review from same user for same booking

reviewSchema.index(
  {
    user: 1,
    booking: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);



// Shop rating calculate helper

reviewSchema.statics.getAverageRating =
async function(shopId){

  const result =
    await this.aggregate([
      
      {
        $match:{
          shop:
          new mongoose.Types.ObjectId(shopId),
          status:"active"
        }
      },

      {
        $group:{
          _id:null,
          average:{
            $avg:"$rating"
          },
          total:{
            $sum:1
          }
        }
      }

    ]);


  return result[0] || {
    average:0,
    total:0
  };

};



module.exports =
mongoose.model(
  "Review",
  reviewSchema
);