const app = require("./app");

console.log(process.env);
app.listen(8080, () => {
  console.log(`Server started at port 8080`);
});
