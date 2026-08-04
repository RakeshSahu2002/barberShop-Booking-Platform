const Shop = require("../models/Shop");
const Service = require("../models/Service");
const Booking = require("../models/booking");


// =====================================
// Browse Approved Shops
// =====================================

const browseShops = async (req, res) => {

  try {

    const { city, search } = req.query;


    let filter = {
      status: "approved"
    };


    if (city) {
      filter["address.city"] = {
        $regex: city,
        $options: "i"
      };
    }


    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }


    const shops = await Shop.find(filter)
      .sort({ createdAt: -1 })
      .populate(
        "owner",
        "name email phone"
      );


    return res.json(shops);


  } catch (error) {

    console.error(
      "Browse Shops Error:",
      error
    );


    res.status(500).json({

      success:false,

      message:"Failed to fetch shops"

    });

  }

};




// =====================================
// Get Shop Details
// =====================================

const getShopDetails = async (req,res)=>{

  try {


    const shop = await Shop.findOne({

      _id:req.params.id,

      status:"approved"

    })
    .populate(
      "owner",
      "name email phone"
    );


    if(!shop){

      return res.status(404).json({

        message:"Shop not found"

      });

    }



    const services = await Service.find({

      shop:shop._id,

      isActive:true

    });



    return res.json({

      ...shop.toObject(),

      services

    });



  } catch(error){


    console.error(
      "Shop Details Error:",
      error
    );


    res.status(500).json({

      message:"Failed to fetch shop details"

    });


  }

};




// =====================================
// Create Booking
// =====================================

const createBooking = async(req,res)=>{


try{


const {

shop_id,

service_id,

staff_id,

booking_date,

booking_time,

customerName,

customerPhone


}=req.body;



if(
!shop_id ||
!service_id ||
!booking_date ||
!booking_time
){

return res.status(400).json({

message:
"Required fields missing"

});

}



const shop = await Shop.findOne({

_id:shop_id,

status:"approved"

});



if(!shop){

return res.status(404).json({

message:"Shop not found"

});

}



const service = await Service.findOne({

_id:service_id,

shop:shop_id,

isActive:true

});



if(!service){

return res.status(404).json({

message:"Service not found"

});

}




const existingBooking = await Booking.findOne({

shop:shop_id,

bookingDate:new Date(booking_date),

bookingTime:booking_time,

status:{
$nin:[
"Cancelled",
"Rejected"
]
}

});



if(existingBooking){

return res.status(400).json({

message:"Slot already booked"

});

}



const amount =
service.finalPrice || service.price;



const commissionAmount =
(amount * service.commission)/100;



const ownerAmount =
amount - commissionAmount;



const booking = await Booking.create({


customer:req.user.id,


shop:shop_id,


service:service_id,


staff:staff_id || null,


customerName:
customerName || "Customer",


customerPhone:
customerPhone || "",


bookingDate:
new Date(booking_date),


bookingTime:
booking_time,


amount,


commissionAmount,


ownerAmount


});



res.status(201).json({

success:true,

message:
"Booking created successfully",

booking


});



}
catch(error){


console.error(
"Create Booking Error:",
error
);


res.status(500).json({

message:
"Booking failed"

});


}


};




// =====================================
// My Bookings
// =====================================

const getMyBookings = async(req,res)=>{


try{


const bookings = await Booking.find({

customer:req.user.id


})

.populate(
"shop",
"name phone address"
)

.populate(
"service",
"name price finalPrice"
)

.populate(
"staff",
"name"
)

.sort({
createdAt:-1
});



res.json(bookings);



}
catch(error){


console.error(
"My Bookings Error:",
error
);



res.status(500).json({

message:
"Failed to fetch bookings"

});


}


};




// =====================================
// Cancel Booking
// =====================================

const cancelBooking = async(req,res)=>{


try{


const booking =
await Booking.findOne({

_id:req.params.id,

customer:req.user.id


});



if(!booking){

return res.status(404).json({

message:"Booking not found"

});

}



if(
booking.status==="Completed"
){

return res.status(400).json({

message:
"Cannot cancel completed booking"

});

}



booking.status="Cancelled";


await booking.save();



res.json({

success:true,

message:
"Booking cancelled"

});



}
catch(error){


console.error(
"Cancel Booking Error:",
error
);


res.status(500).json({

message:
"Cancel failed"

});


}


};



module.exports = {

browseShops,

getShopDetails,

createBooking,

getMyBookings,

cancelBooking

};