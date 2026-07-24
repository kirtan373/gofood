const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://kirtan:kirtan123@cluster0.dirb3l8.mongodb.net/gofood?retryWrites=true&w=majority"
)
.then(() => {
  console.log("Connected successfully!");
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});