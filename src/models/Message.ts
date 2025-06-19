import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  hotel: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  parentMessage?: mongoose.Types.ObjectId;
}

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ hotel: 1 });

export default mongoose.model<IMessage>('Message', messageSchema); 