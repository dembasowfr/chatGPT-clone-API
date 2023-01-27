const express = require("express");
const chatbotRoute = express.Router();
const dbo = require("../database/connection");
const ObjectId = require("mongodb").ObjectId;
const databaseName = process.env.DATABASE_NAME;


//TODO: OPEN AI API PART
const { Configuration, OpenAIApi } = require("openai");



//TODO: CONVERSATION ROUTES
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

//Home page to check if the server is running
chatbotRoute.route("/").get(function (req, res) {
  res.status(200).send({
    message: 'Hello from ChatGPTClone',
  })
});


//GET ALL CONVERSATIONS
chatbotRoute.route("/conversations").get(function (req, res) {
  let db_connect = dbo.getDb();

  db_connect
    .collection("conversations")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});


//GET A CONVERSATION BY ID
chatbotRoute.route("/conversations/:id").get(function (req, res) {


  //If the id is not valid
  if(!ObjectId.isValid(req.params.id)) {
    console.log("Invalid conversation id '"+req.params.id+"'");
    res.json({error: "Invalid conversation id '"+req.params.id+"'"});
    return;
  }

  
  //Else if the id is valid

  let db_connect = dbo.getDb();

  let myquery = { 
    _id: ObjectId(req.params.id) 
  };

  db_connect
    .collection("conversations")
    .findOne(myquery, function (err, result) {
      if (err) throw err;
      //res.json(result);
      //if the conversation doesn't exist
      if(!result) {
        console.log("Conversation '"+req.params.id+"' doesn't exist");
        res.json({error: "Conversation '"+req.params.id+"' doesn't exist"});
      }
      else {
        console.log("Conversation '"+req.params.id+"' found!!!");
        res.json(result);
      }
    });
});


//ADD(POST) A NEW CONVERSATION
chatbotRoute.route("/conversations/add").post(function (req, response) {

  let db_connect = dbo.getDb();

  // Create the conversation object
  //messages is an array of objects here it's empty
  let myobj = {
    _id: req.body.conversationId,
    //here a empty messages collection will be created
    messages: [],
  };
  
  // Insert the conversation into the "conversations" collection
  db_connect.collection("conversations").insertOne(myobj, function (err, res) {
    if (err) throw err;
    console.log("New conversation created successfully!!!");
    response.json(res);

  });
});


//UPDATE A CONVERSATION BY ID
chatbotRoute.route("/conversations/update/:id").post(function (req, response) {


   //If the id is not valid
  if(!ObjectId.isValid(req.params.id)) {
    console.log("Invalid conversation id '"+req.params.id+"'");
    res.json({error: "Invalid conversation id '"+req.params.id+"'"});
    return;
  }

  let db_connect = dbo.getDb();
  //let myquery = { _id: req.params.id };

  //Get the conversation id from the request
  let conversationId = req.params.id;
  let newvalues = {
    $push: {
      messages: {
        messageUniqueID: new mongodb.ObjectId(),
        content: req.body.content
      }
    }
  };
  db_connect
    .collection("conversations")
    .updateOne(
      {
        _id: ObjectId(conversationId)
      }, 
      newvalues, 
      function (err, res) {
        if (err) {
          console.log("Update Error: " + err);
          throw err;
        }
        console.log("Conversation '"+conversationId+"' updated successfully!!!");
        response.json(res);
      }
    );
});


//DELETE A CONVERSATION BY ID
chatbotRoute.route("/conversations/delete/:id").delete((req, response) => {



   //If the id is not valid
  if(!ObjectId.isValid(req.params.id)) {
    console.log("Invalid conversation id '"+req.params.id+"'");
    res.json({error: "Invalid conversation id '"+req.params.id+"'"});
    return;
  }


  let db_connect = dbo.getDb();

  // Get the conversation id from the request
  let conversationId = req.params.id;

  // Check if the conversation already exists
  db_connect.collection("conversations").find({_id: ObjectId(conversationId)}).toArray((err, result) => {
    if (err) {
      console.log("Error finding conversation: " + err);
      response.json({error: "Error finding conversation: " + err});
      return;
    }
    // Let's delete the conversation
    db_connect
      .collection("conversations")
      .deleteOne({ _id: ObjectId(conversationId) }, (err, res) => {
        if (err) {
          console.log("Error deleting conversation: " + err);
          response.json({error: "Error deleting conversation: " + err});
          return;
        }
        console.log("Conversation '"+conversationId+"' deleted successfully!!!");
        response.json("Conversation '"+conversationId+"' deleted successfully!!!");
      });
  });
});



//TODO: CONVERSATION MESSAGE(S) ROUTES

//ADD(POST) A NEW MESSAGE in a given conversation by id
chatbotRoute.route("/conversations/:id/messages/add").post( async function (req, response) {

   //If the id is not valid
  if(!ObjectId.isValid(req.params.id)) {
    console.log("Invalid conversation id '"+req.params.id+"'");
    res.json({error: "Invalid conversation id '"+req.params.id+"'"});
    return;
  }

  let conversationId = req.params.id;
  let db_connect = dbo.getDb();

  

  //Add the new message to the conversation's messages array
  //If the conversation doesn't exist it will be created

  //Check if the conversation already exists
  let conversation = await db_connect.collection("conversations").findOne({_id: ObjectId(conversationId)});
  //console.log(conversation);
  if(!conversation) {

    console.log("Conversation '"+conversationId+"' doesn't exist, creating it...");
    //response.json({error: "Conversation '"+conversationId+"' doesn't exist, creating it..."});
    
    // Create the conversation object
    //messages is an array of objects here it's empty
    let myobj = {
      _id: ObjectId(conversationId),
      //here a empty messages collection will be created
      messages: [],
    };
    
    // Insert the conversation into the "conversations" collection
    await db_connect.collection("conversations").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("'"+conversationId+"' conversation created successfully!!!");
      //response.json(res);
    });

  }

  let prompt = req.body.content;
  //Here for each added message an automatic response will be generated from the OpenAI API
  //The prompt is the message that the user sent
  //The response is the message that the chatbot will send back

  const botResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${prompt}`,
    temperature: 0,
    max_tokens: 3000,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
  })

  bot = botResponse.data.choices[0].text;

  console.log(bot);

 
  //here the mongoDB will create a new unique id for the message
  //Save the message in the conversation's messages array

  let newMessage = {
    messageUniqueID: new ObjectId(),
    userPrompt: prompt,
    botAnswer: bot
  };

  let newvalues = { 
    $push: 
    { 
      messages: newMessage 
    } 
  };
  
  //Add the new message to the conversation's messages array
  await db_connect
    .collection("conversations")
    .updateOne(
      {
        _id: ObjectId(conversationId),
      },
      newvalues,
      function (err, res) {
        if (err) {
          console.log("Error adding message: " + err);
          response.json({error: "Error adding message: " + err});
          return;
        }
        console.log("New message added to conversation '"+conversationId+"' successfully!!!");
        response.json(res);
      }
    );
});

//GET ALL MESSAGES in given conversation by id
chatbotRoute.route("/conversations/:id/messages").get(function (req, res) {


  //If the id is not valid
  if(!ObjectId.isValid(req.params.id)) {
    console.log("Invalid conversation id '"+req.params.id+"'");
    res.json({error: "Invalid conversation id '"+req.params.id+"'"});
    return;
  }

  let db_connect = dbo.getDb();
  let conversationId = req.params.id;
  //if the conversation doesn't exist, return a warning message
  //res.json("The conversation with id '"+conversationId+"' doesn't exist!");
  let conversation = db_connect.collection("conversations").findOne({_id: conversationId});
  if(!conversation) {
    //If the conversation doesn't exist, create it with the same id
    console.log("Conversation '"+conversationId+"' doesn't exist!!!");
    res.json("The conversation with id '"+conversationId+"' doesn't exist!");
  }
  else{
    console.log("Getting Conversation '"+conversationId+"' messages...");
    db_connect
    .collection("conversations")
    .findOne(
      {
        _id: ObjectId(conversationId)
      },
      {
        messages: 1,
        _id: 0
      },
      function (err, result) {
        if (err) throw err;
        res.json(result.messages);
        
      },
      
    );
  }
});

//GET A SPECIFIC MESSAGE BY messageUniqueID in a given conversation by id
chatbotRoute.route("/conversations/:id/messages/:messageUniqueID").get(async function (req, res) {

   //If the id is not valid
  if(!ObjectId.isValid(req.params.id)) {
    console.log("Invalid conversation id '"+req.params.id+"'");
    res.json({error: "Invalid conversation id '"+req.params.id+"'"});
    return;
  }

  let db_connect = dbo.getDb();
  let conversationId = req.params.id;
  let messageUniqueID = req.params.messageUniqueID;

  //Check if the conversation exists

  let conversation = await db_connect.collection("conversations").findOne({_id: ObjectId(conversationId)});
  //console.log(conversation)
  if(!conversation) {
    console.log("Conversation '"+conversationId+"' doesn't exist!!!");
    res.json("The conversation with id '"+conversationId+"' doesn't exist!");
    return;
  }
  if(conversation.messages.length === 0) {
    console.log("Conversation '"+conversationId+"' doesn't have any messages!!!");
    res.json("The conversation with id '"+conversationId+"' doesn't have any messages!");
    return;
  }
  //console.log(conversation.messages);

  //If the conversation exists, check if the message exists
  let message = conversation.messages.find(m => m.messageUniqueID.equals(messageUniqueID));

  //console.log(message);

  if(!message) {
    console.log("Message '"+messageUniqueID+"' doesn't exist!!!");
    res.json("The message with id '"+messageUniqueID+"' doesn't exist!");
    return;
  }else{
    console.log("Getting Conversation '"+conversationId+"' message '"+messageUniqueID+"'...");
    res.json(message);
  }

});

//UPDATE A SPECIFIC MESSAGE by messageUniqueID in a given conversation by id
chatbotRoute.route("/conversations/:id/messages/update/:messageUniqueID").post(async function (req, res) {


  //If the id is not valid
  if(!ObjectId.isValid(req.params.id)) {
    console.log("Invalid conversation id '"+req.params.id+"'");
    res.json({error: "Invalid conversation id '"+req.params.id+"'"});
    return;
  }

  let db_connect = dbo.getDb();
  let conversationId = req.params.id;
  let messageUniqueID = req.params.messageUniqueID;

  //Check if the conversation exists

  let conversation = await db_connect.collection("conversations").findOne({_id: ObjectId(conversationId)});
  //console.log(conversation)
  if(!conversation) {
    console.log("Conversation '"+conversationId+"' doesn't exist!!!");
    res.json("The conversation with id '"+conversationId+"' doesn't exist!");
    return;
  }
  if(conversation.messages.length === 0) {
    console.log("Conversation '"+conversationId+"' doesn't have any messages!!!");
    res.json("The conversation with id '"+conversationId+"' doesn't have any messages!");
    return;
  }
  //console.log(conversation.messages);

  //If the conversation exists, check if the message exists
  let message = await conversation.messages.find(m => m.messageUniqueID.equals(messageUniqueID));

  //console.log(message);

  if(!message) {
    console.log("Message '"+messageUniqueID+"' doesn't exist!!!");
    res.json("The message with id '"+messageUniqueID+"' doesn't exist!");
    return;
  }else{

    console.log("Updating message '"+messageUniqueID+"'...");


    //Get the new message from the request body
    let newPrompt = req.body.userPrompt;

    //Get new bot response for the newly updated message
    const botResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${newPrompt}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    })
  
    newBot = botResponse.data.choices[0].text;
  
    //console.log(newBot);
   
    //Assign the new values to the message
    message.userPrompt = newPrompt;
    message.botAnswer = newBot;

    //Update the message in the conversation
    await db_connect.collection("conversations").updateOne(
      {
        _id: ObjectId(conversationId)
      },
      {
        $set: 
        {
          messages: conversation.messages
        }
      }
    );
    console.log("Message '"+messageUniqueID+"' updated!");
    res.json("Message '"+messageUniqueID+"' updated!");
  }
});

  
//DELETE A SPECIFIC MESSAGE by messageUniqueID in a given conversation by id
chatbotRoute.route("/conversations/:id/messages/delete/:messageUniqueID").delete(async function (req, res) {


  //If the id is not valid
  
  if(!ObjectId.isValid(req.params.id)) {
    console.log("Invalid conversation id '"+req.params.id+"'");
    res.json({error: "Invalid conversation id '"+req.params.id+"'"});
    return;
  }
  let db_connect = dbo.getDb();
  let conversationId = req.params.id;
  let messageUniqueID = req.params.messageUniqueID;

  //Check if the conversation exists

  let conversation = await db_connect.collection("conversations").findOne({_id: ObjectId(conversationId)});
  //console.log(conversation)
  if(!conversation) {
    console.log("Conversation '"+conversationId+"' doesn't exist!!!");
    res.json("The conversation with id '"+conversationId+"' doesn't exist!");
    return;
  }
  if(conversation.messages.length === 0) {
    console.log("Conversation '"+conversationId+"' doesn't have any messages!!!");
    res.json("The conversation with id '"+conversationId+"' doesn't have any messages!");
    return;
  }
  //console.log(conversation.messages);

  //If the conversation exists, check if the message exists
  let message = await conversation.messages.find(m => m.messageUniqueID.equals(messageUniqueID));

  console.log(message);

  if(!message) {
    console.log("Message '"+messageUniqueID+"' doesn't exist!!!");
    res.json("The message with id '"+messageUniqueID+"' doesn't exist!");
    return;
  }else{
    console.log("Deleting message '"+messageUniqueID+"'...");

    //Delete the message from the conversation
    await db_connect.collection("conversations").updateOne(
      {
        _id: ObjectId(conversationId)
      },
      {
        $pull:
        {
          messages: message
        }
      }
    );
    console.log("Message '"+messageUniqueID+"' deleted!");
    res.json("Message '"+messageUniqueID+"' deleted!");
  }
});
  
  
module.exports = chatbotRoute;
