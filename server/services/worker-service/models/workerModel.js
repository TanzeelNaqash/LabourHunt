import mongoose from 'mongoose'
const schema = mongoose.Schema({
    username: {
        type: String,
        Required: true
    },
   
    mobile:{
        type:String,
        Required:true,
        unique:true
    },
    age:{
        type:Number,
        Required:true

    },
    gender:{
        type: String,
        Required: true
    },
    area:{
        type:String,
        Required:true

    },
    country:{
        type: String,
        Required: true
    },
    state:{
        type: String,
        Required: true
    },
    photo:{
        type:String,
        Required:true

    },
    photoid:{
        type:String,
        Required:true

    },
    category:{
        type:String,
        Required:true
    },
    otherCategory:{
        type: String,
        Required: false,
    },
    labourDocument:{
        type:String,
        Required:true

    },
    documentId:{
        type:String,
        Required:true

    },
  
    role:{
        type: String,
        Required: true
    },
    password:{
        type:String,
        Required:true
    },
    isVerified:{
        type:Boolean,
        Required:true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true
    },
    joinedDate:{
        type:Date,
        Required:true
    }
    
   
})

schema.virtual('displayCategory').get(function() {
  return this.category === 'other' && this.otherCategory ? this.otherCategory : this.category;
});

const Worker = mongoose.model('workers',schema)
export default Worker;