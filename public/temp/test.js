// to understrand asyncHandler function in ./src/utils floder
const warpper = (sum) => {
    return (a, b) => {
        console.log(`\na: ${a}\tb: ${b}\n`);
        sum(a, b);
    };
};

console.log(
    warpper((a, b) => {
        console.log(a + b);
    })(5, 2)
);

const arr = ["sahil", "", "umraniay"];

if (arr.some((v) => v.trim() == "")) {
    console.log("Error");
}
