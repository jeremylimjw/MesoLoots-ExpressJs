module.exports = {

    isString: function(value) {
        return typeof value === "string" || value instanceof String;
    },

    isBoolean: function(value) {
        return value === true || value === false
    },

    isArray: function(value) {
        return Array.isArray(value);
    },
    
    isBetween: function(value, min, max) {
        return value.length >= min && value.length <= max
    },

    isDate: function(date) {
        return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
    },

    hasWhiteSpace: function(value) {
        return !new RegExp(/^\S*$/).test(value)
    },

}