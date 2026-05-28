import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const { Schema, model } = mongoose;

// 1. Hospital Schema
const hospitalSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  branchLocation: { 
    type: String, 
    required: true, 
    trim: true 
  },
  contact: { 
    type: String, 
    required: true, 
    match: [/^\d{10}$/, 'Please provide a valid 10-digit contact number'] 
  },
  uniqueRegistrationID: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  }
}, { timestamps: true });

// 2. Appointment Schema
const appointmentSchema = new Schema({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', // Assuming a Patient model exists
    required: true 
  },
  doctorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Doctor',  // Assuming a Doctor model exists
    required: true 
  },
  hospitalId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Hospital', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  timeslot: { 
    type: String, 
    required: true, 
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Timeslot must be in HH:MM-HH:MM format']
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  }
}, { timestamps: true });

// UserSchema
const ROLES = ['super-admin', 'hospital-admin', 'doctor', 'patient', 'pharmacist'];

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: [8, 'Password must be at least 8 characters'] 
  },
  role: { 
    type: String, 
    enum: {
      values: ROLES,
      message: '{VALUE} is not a valid role'
    },
    default: 'patient'
  },
  // Conditionally required field based on the role
  licenseNumber: {
    type: String,
    required: function() {
      return ['doctor', 'pharmacist'].includes(this.role);
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Pre-save hook to hash passwords
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


// Create models
export const User = mongoose.model('User', UserSchema);
export const Hospital = model('Hospital', hospitalSchema);
export const Appointment = model('Appointment', appointmentSchema);
