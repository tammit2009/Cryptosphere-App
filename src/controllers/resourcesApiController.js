/* Resources API Controller */

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

let { cheeses } = require('../data/textDb');

// ===========================================================================
// Add new cheese 
// ---------------------------------------------------------------------------
// Method: 'POST', url = '/api/v1/resources/cheeses', Access: 'Private/ApiKey'
// ===========================================================================
const addCheese = asyncHandler(async (req, res) => {
    let cheese = {
        _id: cheeses.length ? cheeses[cheeses.length - 1]._id + 1 : 1,
        name: req.body.name,
    };
    cheeses.push(cheese);
    res.status(201).send({
        data: cheese,
    });
}); 


// ===========================================================================
// List all cheeses 
// --------------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/resources/cheeses', Access: 'Private/ApiKey'
// Options: use querystring, parameter or inheader: 
// ===========================================================================
const listCheeses = asyncHandler(async (req, res) => {
    res.status(200).json({
        data: cheeses,
    });                                                                        
}); 


// ==============================================================================
// Update a specific cheese 
// ------------------------------------------------------------------------------
// Method: 'PUT', url = '/api/v1/resources/cheeses/:id', Access: 'Private/ApiKey'
// ==============================================================================
const updateCheese = asyncHandler(async (req, res) => {
    const cheese = cheeses.find(cheese => cheese._id === parseInt(req.params.id));
    if (!cheese) {
        return res.status(400).json({ "message": `Cheese ID ${req.params.id} not found` });
    }
    
    // handle multiple parameters if existing
    if (req.body.name) cheese.name = req.body.name;

    const filteredArray = cheeses.filter(cheese => cheese._id !== parseInt(req.params.id));
    const unsortedArray = [...filteredArray, cheese];
    cheeses = unsortedArray.sort((a, b) => a._id > b._id ? 1 : a._id < b._id ? -1 : 0);

    res.status(200).send({
        data: {
            message: `Cheese ${req.params.id} updated.`,
            cheeses
        },
    });
}); 


// =================================================================================
// Delete a specific cheese
// ---------------------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/resources/cheeses/:id', Access: 'Private/ApiKey'
// =================================================================================
const deleteCheese = asyncHandler(async (req, res) => {
    const cheese = cheeses.find(cheese => cheese._id === parseInt(req.params.id));
    if (!cheese) {
        return res.status(400).json({ "message": `Cheese ID ${req.params.id} not found` });
    }
    const filteredArray = cheeses.filter(cheese => cheese._id !== parseInt(req.params.id));
    cheeses = [...filteredArray];

    res.status(200).send({
        data: {
          message: `Cheese ${req.params.id} deleted.`,
          cheeses
        },
    });
}); 


module.exports = { 
    addCheese,
    listCheeses,
    updateCheese,
    deleteCheese
};