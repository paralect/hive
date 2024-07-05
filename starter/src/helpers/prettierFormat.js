import prettier from "prettier";
export default (...params) => {
    return prettier.format(...params, {
        parser: "babel",
        singleQuote: true,
    });
};
