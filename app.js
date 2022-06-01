const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

mongoose.connect("mongodb+srv://vm270400:password@cluster0.aljel.mongodb.net/todoDB?retryWrites=true&w=majority",{ useNewUrlParser: true})

const app = express()
app.use(bodyParser.urlencoded({extended:true}))

app.use(express.static(__dirname + '/public/'))

app.set("view engine","ejs")

const todoSchema = {
  name:String
}

const listSchema = {
  name:String,
  item : [todoSchema]
}

const Todo = mongoose.model("Todo",todoSchema)

const List = mongoose.model("List",listSchema)

const newtodos = [{name:"Welcome to your Todos!"},{name:"Hit the + button to add a new item"},{name:"<-- Hit this to delete an item"}]

app.get("/",function (req,res) {
  Todo.find({},function (err,result) {
    if (result.length==0){

      Todo.insertMany(newtodos,function (err) {
        if (err){
          console.log(err)
        }
        res.redirect('/')
        })
    }else{
    res.render("list",{listTitle:"Today",newItems:result})
    }
    })
    
  })

app.post("/",function (req,res) {
  const item = req.body.newitem
  const listName = req.body.list

  const todo = new Todo({name:item})

  if (listName=="Today"){
    todo.save()
    res.redirect("/")
  }
  else{
    List.findOne({name:listName},function(err,foundlist){
      foundlist.item.push(todo)
      foundlist.save()
      res.redirect("/"+listName)
    })
  }
  })

app.post("/delete",function (req,res) {
  const checkedItemId = req.body.checkedBox
  const checkedList = req.body.checkedList

  if (checkedList=="Today"){
    Todo.findByIdAndRemove(checkedItemId,function (err) { 
      if(err){
        console.log(err)
      }
      else{
        res.redirect("/")
      }
     })
  }else{
    List.findOneAndUpdate({name:checkedList},{$pull:{item:{_id:checkedItemId}}},function (err,foundlist) {
      if (!err){
      res.redirect("/"+checkedList)
      }
      })
  }
  })


app.get("/:customListName",function (req,res) {
  const customList = _.capitalize(req.params.customListName)
  List.findOne({name:customList},function (err,founditems) {
    if (!err){
      if(!founditems){
        const list = new List({
          name:customList,
          item: newtodos
        })
        list.save()
        res.redirect("/"+customList)
      }
      else{
        res.render("list",{listTitle:customList,newItems:founditems.item})
      }
    }
    })
  })

let port = process.env.PORT
if (port==null||port==""){
  port=8080
}
app.listen(port,function () {
    console.log("Server Started")
})
