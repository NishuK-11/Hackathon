const Medicine = require("../models/Medicine");
const cron = require("node-cron")

const checkMedicineExpiry = async()=>{
    try{
        const today = new Date();
        today.setHours(0,0,0,0);
        const result = await Medicine.updateMany(
            {
                expiryDate:{$lt:today},
                stock:{$gt:0},
                status:{$ne:"EXPIRED"}
            },
            {
                $set:{
                    stock:0,
                    status:"EXPIRED"
                }
            }
            
        );
        console.log(
            `Medicine expiry check completed. ${result.modifiedCount} medicine batches expired.`
        );

    }catch(error){
        console.error("Medicine expiry cron error:", error);
    }
};



const startMedicineExpiryCron=()=>{
    cron.schedule("0 0 * * *", async()=>{
        console.log("Running medicine expiry check...");

        await checkMedicineExpiry();
    });
    console.log("Medicine expiry cron job started.");
}

module.exports = startMedicineExpiryCron;

