module.exports.capitalize = (string) => {
    if (!string.length) return string;
    return string[0].toUpperCase() + string.substring(1);
};
