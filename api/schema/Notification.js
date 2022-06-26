import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: [true, "can't be blank"],
        ref: 'User'
    },
    message: {
        type: String,
        required: [true, "can't be blank"],
    },
    link: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    strict: true,
    collection: 'Notification'
});

const notificationModel = mongoose.model('Notification', notificationSchema);

notificationModel.on('index', (err) => {
    if (err) {
        console.error('Notification index error: %s', err);
    } else {
        console.info('Notification indexing complete');
    }
});

export default notificationModel;