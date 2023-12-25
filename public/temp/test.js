// // to understrand asyncHandler function in ./src/utils floder
// const warpper = (sum) => {
//     return (a, b) => {
//         console.log(`\na: ${a}\tb: ${b}\n`);
//         sum(a, b);
//     };
// };

// console.log(
//     warpper((a, b) => {
//         console.log(a + b);
//     })(5, 2)
// );

// const arr = ["sahil", "", "umraniay"];

// if (arr.some((v) => v.trim() == "")) {
//     console.log("Error");
// }

let url =
    "http://res.cloudinary.com/dmgaq60fl/image/upload/v1702491557/xtl1mxazcv15ipohqswa.png";

console.log(url.split("/")[7].split(".")[0]);
