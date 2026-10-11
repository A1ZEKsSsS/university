import mongoose from 'mongoose';

const GraphSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    nodes: [{
        id: { type: String, required: true },
        type: { type: String, default: 'default' },
        position: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
        },
        data: {
            label: { type: String, default: '' },
            color: { type: String, default: '#ffffff' },
        }
    }],

    edges: [{
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        type: { type: String, default: 'bendable' },
        sourceHandle: { type: String },
        targetHandle: { type: String },
        label: { type: String },
        data: {
            weight: { type: Number, default: 0 },
            directionCode: { type: Number, default: 1 },
            offsetX: { type: Number, default: 0 },
            offsetY: { type: Number, default: 0 },
        }
    }],
    resultData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});

export default mongoose.model('Graph', GraphSchema);