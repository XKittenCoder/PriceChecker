const a = 1234;
const b = '123';
let compare = () => {
    if (a==b) {
        return 'Same.';
    } else {
        return 'Not the Same.';
    }
}

console.log(compare(a,b));