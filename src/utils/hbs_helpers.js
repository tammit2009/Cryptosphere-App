
const ROLES = require('../../config/rolesList');

const registerHbsHelpers = (hbs) => {

    hbs.registerHelper('ifdef', function (value, options) { 
        return value !== undefined ? options.fn(this) : options.inverse(this); 
    });
    
    hbs.registerHelper('ifndef', function (value, options) { 
        return value === undefined ? options.fn(this) : options.inverse(this); 
    });

    hbs.registerHelper('ifRole', function (user, roles, roleType, options) {
        if (!user) return options.inverse(this);

        // Get the required ruid and check for match
        const rruid = ROLES[roleType];
        const result = roles.find(ruid => ruid === rruid);
        if (!result) return options.inverse(this);  // not matched

        return options.fn(this);
    });

    hbs.registerHelper("inc", function(value, options) {
        return parseInt(value) + 1;
    });

    hbs.registerHelper('ifNotExistOrTypeofndef', function (value, options) { 
        return (value === undefined || value === "") ? options.fn(this) : options.inverse(this); 
    });

    hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                // console.log(v1, v2);
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });

};

module.exports = registerHbsHelpers;