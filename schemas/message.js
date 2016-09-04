var mongoose = require('mongoose')
var Schema = mongoose.Schema

var MessageSchema = new Schema({
    from: String,
    to: String,
    msg: String,
    mapuser: String,
    time: {
        type: Date,
        default: Date.now()
    }
})

MessageSchema.statics = {
    fetch: function(cb){
        return this
        .find({})
        .sort('meta.updateAt')
        .exec(cb)
    },
    findById: function(id, cb){
        return this
        .findOne({_id: id})
        .exec(cb)
    }
}

module.exports = MessageSchema;