const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

require("./config/db"); // Initialize DB + seed admin

const app = express();


// =====================================
// Security Middleware
// =====================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);


// =====================================
// CORS Configuration (Updated)
// =====================================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://barber-shop-frontend-eosin.vercel.app",
      process.env.FRONTEND_URL,
    ],

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


// JSON Body Limit
app.use(
  express.json({
    limit: "10mb",
  })
);


// Render / Production Proxy Support
app.set("trust proxy", 1);



// =====================================
// Rate Limiting
// =====================================

const limiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 200,

  standardHeaders: true,

  legacyHeaders: false,

  message:{
    success:false,
    message:"Too many requests, please try again later."
  }

});


app.use(limiter);



// =====================================
// API Routes
// =====================================

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



// =====================================
// Health Check
// =====================================

app.get("/",(req,res)=>{

 res.status(200).json({

   success:true,

   message:"Barber Shop Platform API is running 🚀",

   environment:
   process.env.NODE_ENV || "development",

   time:new Date()

 });

});



// Server Status Route

app.get("/api/status",(req,res)=>{

 res.json({

   server:"OK",

   database:"connected",

   uptime:process.uptime()

 });

});




// =====================================
// 404 Handler
// =====================================

app.use((req,res)=>{


 res.status(404).json({

   success:false,

   message:"Route not found."

 });


});




// =====================================
// Global Error Handler
// =====================================

app.use((err,req,res,next)=>{


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




// =====================================
// Start Server
// =====================================

const PORT =
process.env.PORT || 5000;



const server = app.listen(PORT,()=>{


 console.log(
 `
=================================
🚀 Barber Shop Backend Started

PORT: ${PORT}

URL:
http://localhost:${PORT}

ENV:
${process.env.NODE_ENV || "development"}

=================================
 `
 );


});




// =====================================
// Graceful Shutdown
// =====================================


process.on(
 "SIGTERM",
 ()=>{

 console.log(
 "SIGTERM received. Closing server..."
 );


 server.close(()=>{

  console.log(
  "Server closed successfully"
  );

  process.exit(0);

 });


});



process.on(
 "SIGINT",
 ()=>{

 console.log(
 "SIGINT received. Closing server..."
 );


 server.close(()=>{

  console.log(
  "Server closed successfully"
  );

  process.exit(0);

 });


});