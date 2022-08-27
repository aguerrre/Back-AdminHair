const mongoose = require('mongoose');
require('dotenv').config();

const dbConn = async () => {
    try {
        mongoose.connect(process.env.DB_CONN);
        console.log('DB ONLINE');
    } catch (error) {
        console.log(error);
        throw new Error('Error al iniciar la Base de Datos. Ver logs.');
    }
};

module.exports = {
    dbConn,
}