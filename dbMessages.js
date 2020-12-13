import mongoose from 'mongoose';
const whatsappSchema=mongoose.Schema({
    message:String,
    name:String,
    timestamp:String,
    received:Boolean,
});

//collection inside the databse
export default mongoose.model('messagecontents',whatsappSchema);