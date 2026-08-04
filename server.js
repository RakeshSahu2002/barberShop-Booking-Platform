const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

dns.setDefaultResultOrder("ipv4first");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();


// ================================
// MongoDB Connection
// ================================

const connectDB = require("./config/db");


// ================================
// App Initialize
// ================================

const app = express();



// ================================
// Security Middleware
// ================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);



// ================================
// CORS Configuration
// ================================

const allowedOrigins = [

  "http://localhost:3000",

  "http://localhost:3001",

  "http://localhost:5173",

  "https://barber-shop-frontend-eosin.vercel.app"

];


if(process.env.FRONTEND_URL){

  allowedOrigins.push(
    process.env.FRONTEND_URL
  );

}



app.use(
  cors({

    origin: allowedOrigins,

    credentials:true,

    methods:[

      "GET",

      "POST",

      "PUT",

      "DELETE",

      "PATCH",

      "OPTIONS"

    ],


    allowedHeaders:[

      "Content-Type",

      "Authorization"

    ]

  })
);



// ================================
// Body Parser
// ================================


app.use(
 express.json({

  limit:"10mb"

 })
);



// ================================
// Render Proxy
// ================================


app.set(
 "trust proxy",
 1
);



// ================================
// Rate Limit
// ================================


const limiter = rateLimit({

 windowMs:
 15 * 60 * 1000,


 max:200,


 standardHeaders:true,


 legacyHeaders:false,


 message:{

  success:false,

  message:
  "Too many requests, please try again later."

 }

});



app.use(limiter);



// ================================
// API Routes
// ================================


app.use(
 "/api/auth",
 require("./routes/auth.routes")
);



app.use(
 "/api/admin",
 require("./routes/admin.routes")
);



app.use(
 "/api/shop",
 require("./routes/shop.routes")
);



app.use(
 "/api/customer",
 require("./routes/customer.routes")
);



app.use(
 "/api/payment",
 require("./routes/payment.routes")
);



app.use(
 "/api/reviews",
 require("./routes/review.routes")
);




// ================================
// Health Check
// ================================


app.get("/",(req,res)=>{


res.status(200).json({

success:true,


message:
"Barber Shop Platform API is running 🚀",


environment:
process.env.NODE_ENV || "development",


time:new Date()

});


});




// ================================
// Database Status
// ================================


app.get(
"/api/status",
(req,res)=>{


const mongoose =
require("mongoose");


res.json({

server:"OK",


database:
mongoose.connection.readyState === 1
?
"connected"
:
"disconnected",


uptime:
process.uptime()


});


});





// ================================
// 404 Handler
// ================================


app.use(
(req,res)=>{


res.status(404).json({

success:false,


message:
"Route not found."

});


});





// ================================
// Global Error Handler
// ================================


app.use(
(err,req,res,next)=>{


console.error(
"SERVER ERROR:",
err
);



res.status(
err.status || 500
)
.json({

success:false,


message:
err.message ||
"Internal server error."

});


});





// ================================
// Server Start
// ================================


const PORT =
process.env.PORT || 5000;



let server;



connectDB()

.then(()=>{


server =
app.listen(PORT,()=>{


console.log(`
=================================

🚀 Barber Shop Backend Started

PORT:
${PORT}


MongoDB:
Connected


ENV:
${process.env.NODE_ENV || "development"}

=================================
`);


});



})

.catch((error)=>{


console.error(
"❌ MongoDB Connection Failed:",
error.message
);


process.exit(1);


});





// ================================
// Graceful Shutdown
// ================================


process.on(
"SIGTERM",
()=>{


console.log(
"SIGTERM received. Closing server..."
);



if(server){

server.close(()=>{


console.log(
"Server closed successfully"
);


process.exit(0);


});

}


});





process.on(
"SIGINT",
()=>{


console.log(
"SIGINT received. Closing server..."
);



if(server){

server.close(()=>{


console.log(
"Server closed successfully"
);


process.exit(0);


});

}


});