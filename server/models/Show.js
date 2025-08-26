import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
    movie: {type: String, required: true, ref: 'Movie'},
    showDateTime: {type: Date, required: true},
    showPrice: {type: Number, required: true},
    occupiedSeats: {type: Object, default: {}},
    hall: {type: String, required: true},
}, { minimize: false });

// ✅ Add compound index for hall and showDateTime validation
showSchema.index({ hall: 1, showDateTime: 1 });

const Show = mongoose.model("Show", showSchema);

export default Show;