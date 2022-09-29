const { json } = require('express');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const { getDate } = require('javascript-time-ago/gradation');
const Model = require('../models/model');
const UserModel = require('../models/user');
const ChatModel = require('../models/chat');
const MedicalRecordModel = require('../models/medicalrecord');
const MedicalRecordAIModel = require('../models/medicalrecordaidata');
var axios = require('axios');
const VitalDetailsSchema = require('../models/vitalDetails');
const MajorVitalsSchema = require('../models/majorvitals');

const BenificiariesSchema = require('../models/benificiaries');
const LaborderdetailsSchema = require('../models/laborderdetails');
const ReferalsSchema = require('../models/referals');



const sleep = require('util').promisify(setTimeout);

var moment = require('moment');
var haversine = require("haversine-distance");
const LikesModel = require('../models/likes');
const SubCategoryModel = require('../models/subcategories');
const ChatContentModel = require('../models/chatcontent');
const router = express.Router();
var fcm = require('fcm-notification');
var FCM = new fcm('./nearwe-db88e-firebase-adminsdk-92i06-7d33a51877.json');
const { success, error, validation } = require("./responseApi");
const multer = require('multer')

const { exists } = require('../models/model');
const { Mongoose } = require('mongoose');
var multerAzure = require('multer-azure')

const fs = require('fs')



const medicalrecord = require('../models/medicalrecord');
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const client = new TextAnalyticsClient("https://ayushmedicaltestentity.cognitiveservices.azure.com/", new AzureKeyCredential("cd6f3c2b664140b28021da2313b2d050"));

const { FormRecognizerClient } = require("@azure/ai-form-recognizer");
const { ComputerVisionClient } = require("@azure/cognitiveservices-computervision");
const { CognitiveServicesCredentials } = require("@azure/ms-rest-azure-js");
const vitalDetails = require('../models/vitalDetails');
const laborderdetails = require('../models/laborderdetails');
var upload = multer({
  storage: multerAzure({
    account: 'poacdocreport', //The name of the Azure storage account
    key: 'EP8FxGYIqd4Z8qEqypUNrNcz65IPisC7lXDV7Qi8jyQkfIn4Vk3g+4fX01fVD+CmmtwpWRsKSM/Hn2hcJ35iNg==', //A key listed under Access keys in the storage account pane
    container: 'reports',  //Any container name, it will be created if it doesn't exist
    blobPathResolver: function (req, file, callback) {
      var blobPath = GetRandomId(1080, 800000) + ".pdf"
      callback(null, blobPath);
    }
  })
})
var uploadimage = multer({
  storage: multerAzure({
    account: 'poacdocreport', //The name of the Azure storage account
    key: 'EP8FxGYIqd4Z8qEqypUNrNcz65IPisC7lXDV7Qi8jyQkfIn4Vk3g+4fX01fVD+CmmtwpWRsKSM/Hn2hcJ35iNg==', //A key listed under Access keys in the storage account pane
    container: 'reports',  //Any container name, it will be created if it doesn't exist
    blobPathResolver: function (req, file, callback) {
      var blobPath = GetRandomId(1080, 800000) + ".jpg"
      callback(null, blobPath);
    }
  })
})









let ts = Date.now();
function GetRandomId(min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}
function GetDistance(lat1, long1, lat2, long2) {

  var point1 = { lat: lat1, lng: long1 }

  //Second point in your haversine calculation
  var point2 = { lat: lat2, lng: long2 }

  var haversine_m = haversine(point1, point2); //Results in meters (default)
  var haversine_km = haversine_m / 1000; //Results in kilometers

  return haversine_km;
}

Array.prototype.sortAttr = function (attr, reverse) {
  var sorter = function (a, b) {
    var aa = a[attr];
    var bb = b[attr];
    if (aa + 0 == aa && bb + 0 == bb) return aa - bb; // numbers
    else return aa.localeCompare(bb); // strings
  }
  this.sort(function (a, b) {
    var result = sorter(a, b);
    if (reverse) result *= -1;
    return result;
  });
};
Array.prototype.sortAttrViews = function (attr, reverse) {
  var sorter = function (a, b) {
    var aa = a[attr];
    var bb = b[attr];
    if (aa + 0 == aa && bb + 0 == bb) return aa - bb; // numbers
    else return aa.localeCompare(bb); // strings
  }
  this.sort(function (a, b) {
    var result = sorter(b, a);
    if (reverse) result *= -1;
    return result;
  });
};

router.post('/post', async (req, res) => {
  const posts = new Model({
    categoryId: req.body.categoryId,
    postId: GetRandomId(10000, 1000000),
    title: req.body.title,
    isAnonymous: req.body.isAnonymous,
    postViews: 0,
    userId: req.body.userId,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    postType: req.body.postType,
    subCategories: req.body.subCategories,
    categoryName: req.body.categoryName,

    dateTimeStamp: new Date(),
    imageUrl: req.body.imageUrl,

  })




  try {



    const dataToSave = await posts.save();

    var userTokens = [];

    await UserModel.find({}, { "token": 1, "_id": 0 }).exec(function (err, result) {
      if (err) throw err;
      result.forEach(results => {

        if (typeof results.token === 'undefined') {
          //Variable isn't defined
        }
        else {
          var message = {
            data: {
              postId: dataToSave.postId.toString(),
              title: dataToSave.postType == 1 ? "Genaral question asked" : dataToSave.postType == 2 ? "Nearby help" : "Urgent Help needed",
              desc: dataToSave.title,
              type: dataToSave.categoryId,
              imgUrl: ''


            },


          };
          userTokens.push(results.token)
          FCM.sendToMultipleToken(message, userTokens, function (err, response) {
            if (err) {
              console.log('err--', err);
            } else {
              console.log('response-----', response);
            }

          })

        }
      });

    });


  }
  catch (error) {

  }

  res.json(success("Post saved", { data: "0" }, res.statusCode))
})


router.get('/Posts/GetAllPosts/:userId/:latitude/:longitude', async (req, res) => {
  Model.aggregate([

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "userId",
        as: "users"
      },

    },

    {
      $unwind: '$users'
    }
    , {
      $project: {
        _id: 0, "users.image": 1, "users.userId": 1, "postId": 1, "title": 1, "isAnonymous": 1,

        "postViews": 1, "latitude": 1, "longitude": 1, "postType": 1, "categoryName": 1,
        "subCategories": 1, "dateTimeStamp": 1, "users.name": 1, "isLiked": 1, "imageUrl": 1
      }
    }
  ]).exec(function (err, students) {

    students.forEach(result => {
      const unixTime = result.dateTimeStamp;
      const date = new Date(unixTime);
      result.ago = moment(date, "YYYY-MM-DD HH:mm:ss").fromNow();
      result.distance = GetDistance(result.latitude, result.longitude, req.params.latitude, req.params.longitude);

    });
    students.sortAttr("distance")
    res.json(success("OK", { data: students }, res.statusCode))

  });



});

router.get('/Posts/GetAllTrendingPosts/:userId/:latitude/:longitude', async (req, res) => {
  Model.aggregate([{
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "userId",
      as: "users"
    },

  },

  {
    $unwind: '$users'
  }
    , {
    $project: {
      _id: 0, "users.image": 1, "users.userId": 1, "postId": 1, "title": 1, "isAnonymous": 1,

      "postViews": 1, "latitude": 1, "longitude": 1, "postType": 1, "categoryName": 1,
      "subCategories": 1, "dateTimeStamp": 1, "users.name": 1, "isLiked": 1, "imageUrl": 1
    }
  }
  ]).exec(function (err, students) {

    students.forEach(result => {
      const unixTime = result.dateTimeStamp;
      const date = new Date(unixTime);
      result.ago = moment(date, "YYYY-MM-DD HH:mm:ss").fromNow();
      result.distance = GetDistance(result.latitude, result.longitude, req.params.latitude, req.params.longitude);

    });
    students.sortAttrViews("postViews")
    res.json(success("OK", { data: students }, res.statusCode))
  });
});


router.get('/Posts/GetAllWhatisPosts/:userId/:latitude/:longitude', async (req, res) => {
  Model.aggregate([

    { $match: { categoryId: "123251" } },
    {

      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "userId",
        as: "users"
      },

    },

    {
      $unwind: '$users'
    }
    , {
      $project: {
        _id: 0, "users.image": 1, "users.userId": 1, "postId": 1, "title": 1, "isAnonymous": 1,

        "postViews": 1, "latitude": 1, "longitude": 1, "postType": 1, "categoryName": 1,
        "subCategories": 1, "dateTimeStamp": 1, "users.name": 1, "isLiked": 1, "imageUrl": 1
      }
    }
  ]).exec(function (err, students) {

    students.forEach(result => {
      const unixTime = result.dateTimeStamp;
      const date = new Date(unixTime);
      result.ago = moment(date, "YYYY-MM-DD HH:mm:ss").fromNow();
      result.distance = GetDistance(result.latitude, result.longitude, req.params.latitude, req.params.longitude);

    });
    students.sortAttrViews("postViews")
    res.json(success("OK", { data: students }, res.statusCode))
  });

})
router.get('/Posts/GetPost/:userId/:postId', async (req, res) => {

  const posts = req.params.postId
  Model.aggregate([

    { $match: { postId: Number(posts) } },
    {

      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "userId",
        as: "users"
      },

    },

    {
      $unwind: '$users'
    }
    , {
      $project: {
        _id: 0, "users.image": 1, "users.userId": 1, "postId": 1, "title": 1, "isAnonymous": 1,

        "postViews": 1, "latitude": 1, "longitude": 1, "postType": 1, "categoryName": 1,
        "subCategories": 1, "dateTimeStamp": 1, "users.name": 1, "isLiked": 1, "imageUrl": 1
      }
    }
  ]).exec(function (err, students) {

    students.forEach(result => {
      const unixTime = result.dateTimeStamp;
      const date = new Date(unixTime * 1000);
      result.ago = moment(date, "YYYY-MM-DD HH:mm:ss").fromNow();


    });
    res.json(success("OK", { data: students }, res.statusCode))
  });

})
router.get('/getPostLike/:postId/:userId', async (req, res) => {
  try {

    const data = await LikesModel.findOne({ postId: req.params.postId, userId: req.params.userId });
    console.log(req.params.postId, req.params.userId)
    if (data == null) {
      res.json(success("Ok", { data: 0 }, res.statusCode))
    }
    else {
      res.json(success("Ok", { data: 1 }, res.statusCode))
    }

  }
  catch (errors) {
    res.json(error("Something went wrong", res.statusCode))
  }
})


//Update by ID Method
router.get('/Posts/AddPostView/:postId', async (req, res) => {

  Model.findOneAndUpdate({ postId: req.params.postId },
    { $inc: { 'postViews': 1 } },
    { new: true },
    function (err, response) {
      // do something
    });
  res.json(success("View Added ", { data: null }, res.statusCode))


})


//User Routes
router.post('/user/post', async (req, res) => {
  const referedBy=req.body.referedBy
  const data = new UserModel({
    emailAddress: req.body.emailAddress,
    userId: GetRandomId(10000, 1000000),
    name: req.body.name,
    token: req.body.token,
    image: req.body.image,
    referedBy: req.body.referedBy
 

  })

  const user = await UserModel.findOne({
    emailAddress: data.emailAddress,

  });
  if (user == null || user.length == 0) {
    const dataToSave = await data.save();

    if(referedBy != null &&referedBy!=0)
    {


 const referal =await new ReferalsSchema({

    referedBy:referedBy,
    referedTo:dataToSave.userId,
    referedAmount:10,
    status:false

  })

  const referald  =await referal.save();
  console.log(referald)

    }


    res.json(success("User Added SuccessFully", { data: dataToSave }, res.statusCode))
  }
  else {
    res.json(success("User Added SuccessFully", { data: user }, res.statusCode))
  }

})


router.get('/User/UpdateToken/:userId/:token', async (req, res) => {

  var myquery = { userId: req.params.userId };
  var newvalues = { $set: { token: req.params.token } };
  UserModel.findOneAndUpdate(myquery,
    newvalues,
    function (err, response) {
      // do something
    });
  res.json(success("User Token Updated", { data: "1" }, res.statusCode))


})
router.get('/User/UpdateMobile/:userId/:mobile', async (req, res) => {

  var myquery = { userId: req.params.userId };
  var newvalues = { $set: { mobile: req.params.mobile } };
  UserModel.findOneAndUpdate(myquery,
    newvalues,
    function (err, response) {
      // do something
    });
  res.json(success("Phone Number Updated !", { data: "1" }, res.statusCode))


})


router.post('/User/UpdateProfile', async (req, res) => {

  var userId = { userId: req.body.userId };

  var newvalues = { $set: { name: req.body.name, image: req.body.image } };
  UserModel.findOneAndUpdate(Number(userId),
    newvalues,
    function (err, response) {
      if (err == null) {
        res.json(success("Profile Updated Successfully", { data: "0" }, res.statusCode))
      }
      else {
        res.json(success("PRofile Updation failed Try Later ", { data: "1" }, res.statusCode))
      }
    }, { useFindAndModify: false });



})



//likes Routes 

router.post('/likes/post', async (req, res) => {

  const source = await LikesModel.findOne({
    postId: req.body.postId,
    userId: req.body.userId

  });

  if (source == null) {
    var user = new LikesModel(req.body)
    user.subCategoryId = GetRandomId(10000, 1000000),
      await user.save();
    res.json(success("Liked Successfully", { data: "1" }, res.statusCode))
  }
  else {
    const id = source._id;
    const data = await LikesModel.findByIdAndDelete(id)
    res.json(success("Unliked", { data: "0" }, res.statusCode))

  }

});



router.post('/AddWhatIsPost', upload.single("file"), async function (req, res, next) {
  console.log(req.file)
  const posts = new Model({
    categoryId: req.body.categoryId,
    postId: GetRandomId(10000, 1000000),
    title: req.body.title,
    isAnonymous: req.body.isAnonymous,
    postViews: 0,
    userId: req.body.userId,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    postType: req.body.postType,
    subCategories: req.body.subCategories,
    categoryName: req.body.categoryName,

    dateTimeStamp: new Date(),
    imageUrl: req.file.url,

  })
  try {



    const dataToSave = await posts.save();

    var userTokens = [];

    await UserModel.find({}, { "token": 1, "_id": 0 }).exec(function (err, result) {
      if (err) throw err;
      result.forEach(results => {

        if (typeof results.token === 'undefined') {
          //Variable isn't defined
        }
        else {
          var message = {
            data: {
              postId: dataToSave.postId.toString(),
              title: dataToSave.postType == 1 ? "Genaral question asked" : dataToSave.postType == 2 ? "Nearby help" : "Urgent Help needed",
              desc: dataToSave.title,
              type: dataToSave.categoryId,
              imgUrl: dataToSave.imageUrl.toString()


            },


          };
          userTokens.push(results.token)
          console.log(message)
          FCM.sendToMultipleToken(message, userTokens, function (err, response) {
            if (err) {
              //  console.log('err--', err);
            } else {
              //console.log('response-----', response);
            }

          })

        }
      });

    });


  }
  catch (error) {

  }

  res.json(success("Post saved", { data: "0" }, res.statusCode))

});
router.post('/AddCommentImage', upload.single("file"), async function (req, res, next) {
  console.log(req.file)


  res.json(success("Image Uploaded", { data: req.file.url, }, res.statusCode))

});


router.get('/getSubCategories/:categoryId', async (req, res) => {

  const categoryId = req.params.categoryId


  try {

    const data = await SubCategoryModel.find({ categoryId: Number(categoryId) });


    res.json(success("Ok", { data: data }, res.statusCode))
  }
  catch (errors) {
    res.json(error("Something went wrong", res.statusCode))
  }
})

router.post('/subCategories/post', async (req, res) => {


  var user = new SubCategoryModel(req.body)
  await user.save();
  res.json(success("OsubCategories Added", { data: "1" }, res.statusCode))




});



router.post('/fileupload', upload.single("file"), async function (req, res, next) {




  const medicalrecordModel = new MedicalRecordModel({
    recordId: GetRandomId(10000, 1000000),
    dateTimeStamp: new Date(),
    fileUrl: req.file.url,
    fileType: 1,
    userId: req.body.userId,
    smartReport: 0

  })
  medicalrecordModel.save()
  res.json(success("Record Saved! We will update once Smart Report Gets Generated", { data: 1 }, res.statusCode))
  var printedTextSampleURL = req.file.url; // pdf/jpeg/png/tiff formats

  const computerVisionKey = "f2dbc76f58874d1b8c87110eaefc55de";
  const computerVisionEndPoint = "https://ayushmanocrdetectionpdf.cognitiveservices.azure.com/";
  const cognitiveServiceCredentials = new CognitiveServicesCredentials(computerVisionKey);
  const computerVisionClient = new ComputerVisionClient(cognitiveServiceCredentials, computerVisionEndPoint);

  const printedResult = await readTextFromURL(computerVisionClient, printedTextSampleURL);

  var data = "";
  var hasRecords = false
  for (const page in printedResult) {

    const result = printedResult[page];
    if (result.lines) {
      if (result.lines.length) {
        for (const line of result.lines) {

          data = data + " " + line.text + " "
        }
      }
    }

    else { }
  }


  var documents = [
    data
  ];
  const poller = await client.beginAnalyzeHealthcareEntities(documents);
  const results = await poller.pollUntilDone();
  var Dated = "";
  for await (const result of results) {


    if (!result.error) {
      var TextName = "";
      var TEST_VALUE = "";
      var TEST_Unit = "";
      var NormalizedText = "";
      for (const entity of result.entities) {
        if (entity.category == "Date"&&Dated=="") {
          Dated=entity.text
        }
        if (entity.category == "ExaminationName" && entity.text != "RESULT IN INDEX" && entity.text != "Hence" && entity.text != "TextName" && entity.text != "Test" && entity.text != "test" && entity.text != "Lab" && entity.text != "Tests" && entity.text != "blood" && entity.text != "Count" && entity.text != "RESULT IN INDEX REMARKS") {

          TextName = entity.text
          hasRecords = true
          NormalizedText = entity.normalizedText

        }
        if (entity.category == "MeasurementValue") {

          TEST_VALUE = entity.text
          hasRecords = true


        }
        if (entity.category == "MeasurementUnit") {
          TEST_Unit = entity.text
          hasRecords = true
          //
        }

        if (TextName != "" && TEST_VALUE != "" && TEST_Unit != "") {
          var vitalId = 0
          NormalizedText ? NormalizedText.toString() : 'Undetermined'
          const data = new VitalDetailsSchema({

            vitalId: GetRandomId(10000, 1000000),
            normalizedText: NormalizedText == "" ? "Undetermined" : NormalizedText,
            normalvalues: "Undetermined",
            description: "Undetermined"


          })
          const user = await VitalDetailsSchema.findOne({
            normalizedText: NormalizedText

          });
          if (user == null || user.length == 0) {
            const dataToSave = await data.save();
            console.log("not found" + vitalId)
            vitalId = data.vitalId

          }
          else {
            vitalId = user.vitalId
            console.log("found" + vitalId)
          }

          const medicalRecordAIModel = new MedicalRecordAIModel({
            mraiId: GetRandomId(10000, 1000000),
            recordId: medicalrecordModel.recordId,
            testname: TextName,
            testvalue: TEST_VALUE,
            testunit: TEST_Unit,
            normalizedText: NormalizedText,
            vitalId: vitalId,
            dated:Dated,
            userId:req.body.userId

          })
          medicalRecordAIModel.save()
          TextName = "";
          TEST_VALUE = "";
          TEST_Unit = "";
          if (hasRecords) {
            var myquery = { recordId: medicalrecordModel.recordId };
            var newvalues = { $set: { smartReport: 1 } };
            MedicalRecordModel.findOneAndUpdate(myquery,
              newvalues,
              function (err, response) {
                // do something
              });
          }
          else {
            var myquery = { recordId: medicalrecordModel.recordId };
            var newvalues = { $set: { smartReport: 2 } };
            MedicalRecordModel.findOneAndUpdate(myquery,
              newvalues,
              function (err, response) {
                // do something
              });
          }

          continue;


        }



      }

    } else console.error("\tError:", result.error);
  }





})
router.post('/fileuploadImage', uploadimage.single("file"), async function (req, res, next) {




  const medicalrecordModel = new MedicalRecordModel({
    recordId: GetRandomId(10000, 1000000),
    dateTimeStamp: new Date(),
    fileUrl: req.file.url,
    fileType: 2,
    userId: req.body.userId,
    smartReport: 0

  })
  medicalrecordModel.save()
  res.json(success("Record Saved! We will update once Smart Report Gets Generated", { data: 1 }, res.statusCode))
  var printedTextSampleURL = req.file.url; // pdf/jpeg/png/tiff formats

  const computerVisionKey = "f2dbc76f58874d1b8c87110eaefc55de";
  const computerVisionEndPoint = "https://ayushmanocrdetectionpdf.cognitiveservices.azure.com/";
  const cognitiveServiceCredentials = new CognitiveServicesCredentials(computerVisionKey);
  const computerVisionClient = new ComputerVisionClient(cognitiveServiceCredentials, computerVisionEndPoint);

  const printedResult = await readTextFromURL(computerVisionClient, printedTextSampleURL);

  var data = "";
  var hasRecords = false
  for (const page in printedResult) {

    const result = printedResult[page];
    if (result.lines) {
      if (result.lines.length) {
        for (const line of result.lines) {

          data = data + " " + line.text + " "
        }
      }
    }

    else { }
  }
console.log(data)

  var documents = [
    data
  ];
  const poller = await client.beginAnalyzeHealthcareEntities(documents);
  const results = await poller.pollUntilDone();
  var Dated = "";
  for await (const result of results) {


    if (!result.error) {
      var TextName = "";
      var TEST_VALUE = "";
      var TEST_Unit = "";
      var NormalizedText = "";
 
      for (const entity of result.entities) {

        if (entity.category == "Date"&&Dated=="") {
          Dated=entity.text
        }

        if (entity.category == "ExaminationName" && entity.text != "RESULT IN INDEX" && entity.text != "Hence" && entity.text != "TextName" && entity.text != "Test" && entity.text != "test" && entity.text != "Lab" && entity.text != "Tests" && entity.text != "blood" && entity.text != "Count" && entity.text != "RESULT IN INDEX REMARKS") {

          TextName = entity.text
          NormalizedText = entity.normalizedText
          hasRecords = true

        }
        if (entity.category == "MeasurementValue") {

          TEST_VALUE = entity.text
          hasRecords = true


        }
        if (entity.category == "MeasurementUnit") {
          TEST_Unit = entity.text
          hasRecords = true
          //
        }

        if (TextName != "" && TEST_VALUE != "" && TEST_Unit != "") {


          var vitalId = 0
          NormalizedText ? NormalizedText.toString() : 'Undetermined'
          const data = new VitalDetailsSchema({

            vitalId: GetRandomId(10000, 1000000),
            normalizedText: NormalizedText == "" ? "Undetermined" : NormalizedText,
            normalvalues: "Undetermined",
            description: "Undetermined"


          })

          const user = await VitalDetailsSchema.findOne({
            normalizedText: NormalizedText

          });
          if (user == null || user.length == 0) {
            const dataToSave = await data.save();

            vitalId = data.vitalId

          }
          else {
            vitalId = user.vitalId

          }










































          const medicalRecordAIModel = new MedicalRecordAIModel({
            mraiId: GetRandomId(10000, 1000000),
            recordId: medicalrecordModel.recordId,
            testname: TextName,
            testvalue: TEST_VALUE,
            testunit: TEST_Unit,
            normalizedText: NormalizedText,
            vitalId: vitalId,
            dated:Dated,
            userId:req.body.userId

          })
          medicalRecordAIModel.save()
          TextName = "";
          TEST_VALUE = "";
          TEST_Unit = "";
          if (hasRecords) {
            var myquery = { recordId: medicalrecordModel.recordId };
            var newvalues = { $set: { smartReport: 1 } };
            MedicalRecordModel.findOneAndUpdate(myquery,
              newvalues,
              function (err, response) {
                // do something
              });
          }
          else {
            var myquery = { recordId: medicalrecordModel.recordId };
            var newvalues = { $set: { smartReport: 2 } };
            MedicalRecordModel.findOneAndUpdate(myquery,
              newvalues,
              function (err, response) {
                // do something
              });
          }

          continue;
        }
      }

    } else console.error("\tError:", result.error);
  }


})
async function readTextFromURL(client, url) {
  // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
  let result = await client.read(url);
  // Operation ID is last path segment of operationLocation (a URL)
  let operation = result.operationLocation.split('/').slice(-1)[0];

  // Wait for read recognition to complete
  // result.status is initially undefined, since it's the result of read
  while (result.status !== "succeeded") { await sleep(1000); result = await client.getReadResult(operation); }

  return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
}






router.get('/medicalreport/GetReport/:userId', async (req, res) => {

  const userId = req.params.userId
  MedicalRecordModel.aggregate([

    { $match: { userId: Number(userId) } },


  ]).exec(function (err, students) {

    students.forEach(result => {
      const unixTime = result.dateTimeStamp;
      const date = new Date(unixTime);
      result.ago = moment(date, "YYYY-MM-DD HH:mm:ss").fromNow();


    });
    res.json(success("OK", { data: students }, res.statusCode))
  });

})
router.get('/medicalreport/GetSmartReport/:recordId', async (req, res) => {
  const recordId = req.params.recordId

  MedicalRecordAIModel.aggregate([
    { $match: { recordId: Number(recordId) } },

    {

      $lookup: {
        from: "vitaldetailsschemas",
        localField: "vitalId",
        foreignField: "vitalId",
        as: "vitaldetails"
      },

    }
    ,
  ]).exec(function (err, students) {
    res.json(success("OK", { data: students }, res.statusCode))
  });

})













































router.post('/vitaldetails/post', async (req, res) => {


  const posts = new VitalDetailsSchema({

    vitalId: GetRandomId(10000, 1000000),
    normalizedText: req.body.normalizedText,
    normalvalues: req.body.normalvalues,
    description: req.body.description,
    majorVitalId: req.body.majorVitalId,
    

  })
  posts.save()
  res.json(success("OK", { data: posts }, res.statusCode))



});

router.get('/vitaldetails/getcharts/:userId/:vitalId', async (req, res) => {
  const userId = req.params.userId
  const vitalId = req.params.vitalId
  try {
    MedicalRecordAIModel.aggregate([
      { $match: { $and: [{ userId: Number(userId) }, { vitalId: Number(vitalId) }] } },

    ]).exec(function (err, students) {
      res.json(success("OK", { data: students }, res.statusCode))
    });
  }
  catch (errors) {
    res.json(error(errors.message, res.statusCode))
  }
});
router.get('/vitaldetails/updateVitalValue/:mraiId/:testvalue/:testname', async (req, res) => {

  var myquery = { mraiId: Number(req.params.mraiId) };
  var newvalues = { $set: { testvalue: req.params.testvalue ,testname: req.params.testname} };
  MedicalRecordAIModel.findOneAndUpdate(myquery,
    newvalues,
    function (err, response) {
      // do something
    });
  res.json(success("Record Successfully Updated", { data: "1" }, res.statusCode))


})
router.post('/vitaldetails/addnewLabVital',  async  (req, res) => {

 var recordId=req.body.recordId
 var userId=req.body.userId
 var data=req.body.data
 var Dated=req.body.dated
 console.log(data+"aa")
 res.json(success("Record Added Updated", { data: "1" }, res.statusCode))
  var documents = [
    data
  ];
  const poller = await client.beginAnalyzeHealthcareEntities(documents);
  const results = await poller.pollUntilDone();

  for await (const result of results) {


    if (!result.error) {
      var TextName = "";
      var TEST_VALUE = "";
      var TEST_Unit = "";
      var NormalizedText = "";
 
      for (const entity of result.entities) {


        if (entity.category == "ExaminationName" && entity.text != "RESULT IN INDEX" && entity.text != "Hence" && entity.text != "TextName" && entity.text != "Test" && entity.text != "test" && entity.text != "Lab" && entity.text != "Tests" && entity.text != "blood" && entity.text != "Count" && entity.text != "RESULT IN INDEX REMARKS") {

          TextName = entity.text
          NormalizedText = entity.normalizedText
          hasRecords = true

        }
        if (entity.category == "MeasurementValue") {

          TEST_VALUE = entity.text
          hasRecords = true


        }
        if (entity.category == "MeasurementUnit") {
          TEST_Unit = entity.text
          hasRecords = true
          //
        }

        if (TextName != "" && TEST_VALUE != "" && TEST_Unit != "") {


          var vitalId = 0
          NormalizedText ? NormalizedText.toString() : 'Undetermined'
          const data = new VitalDetailsSchema({

            vitalId: GetRandomId(10000, 1000000),
            normalizedText: NormalizedText == "" ? "Undetermined" : NormalizedText,
            normalvalues: "Undetermined",
            description: "Undetermined"


          })

          const user = await VitalDetailsSchema.findOne({
            normalizedText: NormalizedText

          });
          if (user == null || user.length == 0) {
            const dataToSave = await data.save();

            vitalId = data.vitalId

          }
          else {
            vitalId = user.vitalId

          }










































          const medicalRecordAIModel = new MedicalRecordAIModel({
            mraiId: GetRandomId(10000, 1000000),
            recordId:recordId,
            testname: TextName,
            testvalue: TEST_VALUE,
            testunit: TEST_Unit,
            normalizedText: NormalizedText,
            vitalId: vitalId,
            dated:Dated,
            userId:userId

          })
          medicalRecordAIModel.save()
          TextName = "";
          TEST_VALUE = "";
          TEST_Unit = "";
         
          continue;
        }
      }

    } else console.error("\tError:", result.error);
  }


})
router.post('/fileuploadImagePrescriptions', uploadimage.single("file"), async function (req, res, next) {




  const medicalrecordModel = new MedicalRecordModel({
    recordId: GetRandomId(10000, 1000000),
    dateTimeStamp: new Date(),
    fileUrl: req.file.url,
    fileType: 2,
    userId: req.body.userId,
    smartReport: 0

  })
 // medicalrecordModel.save()
  res.json(success("Record Saved! We will update once Smart Report Gets Generated", { data: 1 }, res.statusCode))
  var printedTextSampleURL = req.file.url; // pdf/jpeg/png/tiff formats

  const computerVisionKey = "f2dbc76f58874d1b8c87110eaefc55de";
  const computerVisionEndPoint = "https://ayushmanocrdetectionpdf.cognitiveservices.azure.com/";
  const cognitiveServiceCredentials = new CognitiveServicesCredentials(computerVisionKey);
  const computerVisionClient = new ComputerVisionClient(cognitiveServiceCredentials, computerVisionEndPoint);

  const printedResult = await readTextFromURL(computerVisionClient, printedTextSampleURL);

  var data = "";
  var hasRecords = false
  for (const page in printedResult) {

    const result = printedResult[page];
    if (result.lines) {
      if (result.lines.length) {
        for (const line of result.lines) {

          data = data + " " + line.text + " "
        }
      }
    }

    else { }
  }
console.log(data)

  var documents = [
    data
  ];
  const poller = await client.beginAnalyzeHealthcareEntities(documents);
  const results = await poller.pollUntilDone();
  var Dated = "";

  for await (const result of results) {

    console.log(result)
  /*   if (!result.error) {
      var TextName = "";
      var TEST_VALUE = "";
      var TEST_Unit = "";
      var NormalizedText = "";
 
      for (const entity of result.entities) {

        if (entity.category == "Date"&&Dated=="") {
          Dated=entity.text
        }

        if (entity.category == "ExaminationName" && entity.text != "RESULT IN INDEX" && entity.text != "Hence" && entity.text != "TextName" && entity.text != "Test" && entity.text != "test" && entity.text != "Lab" && entity.text != "Tests" && entity.text != "blood" && entity.text != "Count" && entity.text != "RESULT IN INDEX REMARKS") {

          TextName = entity.text
          NormalizedText = entity.normalizedText
          hasRecords = true

        }
        if (entity.category == "MeasurementValue") {

          TEST_VALUE = entity.text
          hasRecords = true


        }
        if (entity.category == "MeasurementUnit") {
          TEST_Unit = entity.text
          hasRecords = true
          //
        }

        if (TextName != "" && TEST_VALUE != "" && TEST_Unit != "") {


          var vitalId = 0
          NormalizedText ? NormalizedText.toString() : 'Undetermined'
          const data = new VitalDetailsSchema({

            vitalId: GetRandomId(10000, 1000000),
            normalizedText: NormalizedText == "" ? "Undetermined" : NormalizedText,
            normalvalues: "Undetermined",
            description: "Undetermined"


          })

          const user = await VitalDetailsSchema.findOne({
            normalizedText: NormalizedText

          });
          if (user == null || user.length == 0) {
            const dataToSave = await data.save();

            vitalId = data.vitalId

          }
          else {
            vitalId = user.vitalId

          }










































          const medicalRecordAIModel = new MedicalRecordAIModel({
            mraiId: GetRandomId(10000, 1000000),
            recordId: medicalrecordModel.recordId,
            testname: TextName,
            testvalue: TEST_VALUE,
            testunit: TEST_Unit,
            normalizedText: NormalizedText,
            vitalId: vitalId,
            dated:Dated,
            userId:req.body.userId

          })
          medicalRecordAIModel.save()
          TextName = "";
          TEST_VALUE = "";
          TEST_Unit = "";
          if (hasRecords) {
            var myquery = { recordId: medicalrecordModel.recordId };
            var newvalues = { $set: { smartReport: 1 } };
            MedicalRecordModel.findOneAndUpdate(myquery,
              newvalues,
              function (err, response) {
                // do something
              });
          }
          else {
            var myquery = { recordId: medicalrecordModel.recordId };
            var newvalues = { $set: { smartReport: 2 } };
            MedicalRecordModel.findOneAndUpdate(myquery,
              newvalues,
              function (err, response) {
                // do something
              });
          }

          continue;
        }
      }

    } else console.error("\tError:", result.error); */
  }
 

})


router.post('/majorvitals/post', async (req, res) => {


  const posts = new MajorVitalsSchema({

    majorVitalId: GetRandomId(10000, 1000000),
    normalizedText: req.body.normalizedText,
    image: req.body.image,
  })
  posts.save()
  res.json(success("OK", { data: posts }, res.statusCode))
});




router.get('/smartHealth/GetSmartHealthAnalysis/:userId', async (req, res) => {
  const userId = req.params.userId

  MajorVitalsSchema.aggregate([
  

    {

      $lookup: {
        from: "vitaldetailsschemas",
        localField: "majorVitalId",
        foreignField: "majorVitalId",
        as: "vitaldetails"
      },

    },
 
   
    { 
      $unwind: "$vitaldetails" 
  },
 
  {

    $lookup: {
      from: "medicalrecordaidatas",
      localField: "vitaldetails.vitalId",
      foreignField: "vitalId",
  
      as: "medicalrecord"
    },

  },

  { $group:{ _id:'$_id', data: { $push: '$$ROOT' }} },
 

 
    
  ]).exec(function (err, students) {









    res.json(success("OK", { data: students }, res.statusCode))
  });

})



router.post('/vitaldetails/addHeartRate',  async  (req, res) => {
  const medicalRecordAIModel = new MedicalRecordAIModel({
    mraiId: GetRandomId(10000, 1000000),
    recordId:0,
    testname: req.body.testname,
    testvalue:req.body.testvalue,
    testunit: req.body.testunit,
    normalizedText: req.body.normalizedText,
    vitalId: req.body.vitalId,
    dated:req.body.dated,
    userId:req.body.userId

  })
  medicalRecordAIModel.save()
  res.json(success("Heart Rates  Added", { data: "1" }, res.statusCode))
 
 })




 router.get('/getvitals/getvitalsByMajorVitalId/:majorVitalId', async (req, res) => {
  const majorVitalId = req.params.majorVitalId

 
  const data = await vitalDetails.find({ majorVitalId: Number(majorVitalId) });

  res.json(success("Vitals Fetched Succeddfully", { data: data }, res.statusCode))

})











 router.get('/labtest/getProviderToken/:providerId',  async  (req, res) => {
 var providerId=req.params.providerId
if(providerId==1)
{
  var config = {
  baseURL: 'https://velso.thyrocare.cloud/api',
}


axios.post('/Login/Login', {
  username: "9650269758",  password: "050A24",  portalType: "", userType: "dsa", facebookId: "string",  mobile: "string" 
},config)
.then(function (response) {
 res.json(success("Meddleware Logged In", { data: response.data.apiKey}, res.statusCode))
})
.catch(function (error) {

});
}
 })




 router.post('/labtest/gettests',  async  (req, res) => {

  var providerId=req.body.providerId
  var testtype=req.body.type
  var vendorApiKey=req.body.apiKey

 if(providerId==1)
 {
   var config = {
   baseURL: 'https://velso.thyrocare.cloud/api',
 }
 
 
 axios.post('/productsmaster/Products', {ProductType: testtype,  apiKey: vendorApiKey},config)
 .then(function (response) {
 

  let testsArray = [];
switch (testtype) {
  case 'TEST':
  
    response.data.master.tests.forEach(results => {
      let childArray = [];
      results.childs.forEach(child => {
        childArray.push({
    
          name: child.name,
          code: child.code,
          groupName: results.groupName,
      });
      });
  
      testsArray.push({
        name: results.name,
        code: results.code,
        testCount: results.testCount,
        fasting: results.fasting,
        diseaseGroup: results.diseaseGroup,
        units: results.units,
        groupName: results.groupName,
        category: results.category,
        rate:results.rate.b2C,
        discount:results.rate.b2B,
       
        testlist:childArray
  
    });
        });
  
      
  
  
  
    res.json(success("Lab Tests Feched Successfully", { data: testsArray}, res.statusCode))
    break;

  case 'Profile':
    console.log('Profile');
    
    response.data.master.profile.forEach(results => {
      let childArray = [];
      results.childs.forEach(child => {
        childArray.push({
    
          name: child.name,
          code: child.code,
          groupName: results.groupName,
      });
      });
  
      testsArray.push({
        name: results.name,
        code: results.code,
        testCount: results.testCount,
        fasting: results.fasting,
        diseaseGroup: results.diseaseGroup,
        units: results.units,
        groupName: results.groupName,
        category: results.category,
        rate:results.rate.b2C,
        discount:results.rate.b2B,
        image:results.imageMaster[0].imgLocations,
        image1:results.imageMaster[1].imgLocations,
        testlist:childArray
  
    });
        });
  
      
  
  
  
    res.json(success("Lab Tests Feched Successfully", { data: testsArray}, res.statusCode))
    break;
    case 'Offer':
      console.log('Offer');
     
  response.data.master.offer.forEach(results => {
    let childArray = [];
    results.childs.forEach(child => {
      childArray.push({
  
        name: child.name,
        code: child.code,
        groupName: results.groupName,
    });
    });

    testsArray.push({
      name: results.name,
      code: results.code,
      testCount: results.testCount,
      fasting: results.fasting,
      diseaseGroup: results.diseaseGroup,
      units: results.units,
      groupName: results.groupName,
      category: results.category,
      rate:results.rate.b2C,
      discount:results.rate.b2B,
      image:results.imageMaster[0].imgLocations,
      image1:results.imageMaster[1].imgLocations,
      testlist:childArray

  });
      });

    



  res.json(success("Lab Tests Feched Successfully", { data: testsArray}, res.statusCode))
      break;
  default:
    console.log(`Sorry, we are out of ${testtype}.`);
}

 
 })
 .catch(function (error) {
  console.log(error)
 });
 }
  })


  
 
  router.post('/labtest/getAppontmentSlots',  async  (req, res) => {

      var providerId=req.body.providerId
      var pincode=req.body.Pincode
      var vendorApiKey=req.body.apiKey
      var date=req.body.date
     if(providerId==1)
     {
       var config = {
       baseURL: 'https://velso.thyrocare.cloud/api',
     }
     
     
     axios.post('/TechsoApi/GetAppointmentSlots', {Pincode: pincode,  ApiKey: vendorApiKey,  Date: date},config)
     .then(function (data) {
       let testsArray = [];
       data.data.lSlotDataRes.forEach(child => {
        testsArray.push({
    
          id: child.id,
          slot: child.slot,
      
      });
      }); 
      res.json(success(data.data.response, { data:testsArray}, res.statusCode))
    
     
     })
     .catch(function (error) {
      console.log(error)
     });
     }
      })




  router.post('/labtest/verifyPinCodeAvaiblity',  async  (req, res) => {

        var providerId=req.body.providerId
        var pincode=req.body.Pincode
        var vendorApiKey=req.body.apiKey
       
       if(providerId==1)
       {
         var config = {
         baseURL: 'https://velso.thyrocare.cloud/api',
       }
       
       
       axios.post('/TechsoApi/PincodeAvailability', {Pincode: pincode,  ApiKey: vendorApiKey},config)
       .then(function (data) {
        
        res.json(success(data.data.response, { data:data.data}, res.statusCode))
      
       
       })
       .catch(function (error) {
        console.log(error)
       });
       }
        })
  


  router.post('/labtest/bookLabTest',  async  (req, res) => {
    var userId=req.body.userId
        var providerId=req.body.providerId
      
        var vendorApiKey=req.body.apiKey
       
        var Email=req.body.Email
        var Gender=req.body.Gender
        var Mobile=req.body.Mobile
        var Address=req.body.Address
        var ApptDate=req.body.ApptDate
        var Pincode=String(req.body.Pincode)
        var Product= req.body.Product
        var Rate= req.body.Rate
        var Reports = req.body.Reports
        var BenCount= req.body.BenCount
        var ReportCode= req.body.ReportCode
        var BenDataXML= req.body.BenDataXML
       
       

      
        
        
       if(providerId==1)
       {
         var config = {
         baseURL: 'https://velso.thyrocare.cloud/api',
          headers: {
    'Content-Type': 'application/json'
  }
       }
       
     
        axios.post('/BookingMaster/DSABooking', { 
        ApiKey:vendorApiKey,
         Email:Email,
         Gender:Gender,
         Mobile:Mobile,
         Address:Address,
         ApptDate:ApptDate,
         Pincode:String(Pincode),
         Product: Product,
         Rate: Rate,
    
         ReportCode:ReportCode, 
         Reports : Reports,
         BenCount:BenCount,

         BenDataXML:BenDataXML,
         Margin:"0",
         OrderId: String(GetRandomId(10000, 1000000)),
         OrderBy:"DSA",
         Passon: 0,
         PayType: "Postpaid",
         PhoneNo:"",
       
         Remarks:"",
        
         ServiceType: "H",
         RefCode: "9650269758"},config)
       .then(function (data) {
        console.log(data)

        if(data.data.respId=="RES02012")
        {
          

          const laborderdetails = new LaborderdetailsSchema({
            orderId:data.data.refOrderId,
           
            userId:req.body.userId,


             providerId:req.body.providerId,
             bookedOn:req.body.providerId,
             
           
         
             address:req.body.Address,
             bookedOn: new Date(),
          
             product: req.body.Product,
             rate: data.data.customerRate,
             paymentType: data.data.payType,
          
             serviceType: data.data.serviceType,
          
        
             appointmentDate:ApptDate,
           
        
          })
          laborderdetails.save()
          


        }






        res.json(success("Done", { data:data.data}, res.statusCode))
         
















       
       })
       .catch(function (error) {
        if (error.response) {
          console.log(error.response.data);
        
        }
       });  
       }})


  router.post('/vitaldetails/addCustomVitalRecords',  async  (req, res) => {
          const medicalRecordAIModel = new MedicalRecordAIModel({
            mraiId: GetRandomId(10000, 1000000),
            recordId:0,
            testname: req.body.testname,
            testvalue:req.body.testvalue,
            testunit: req.body.testunit,
            normalizedText: req.body.normalizedText,
            vitalId: req.body.vitalId,
            dated:req.body.dated,
            userId:req.body.userId,
            majorVitalId: req.body.majorVitalId,
        
          })
          medicalRecordAIModel.save()
          res.json(success("Vitals Added  Successfully", { data: "1" }, res.statusCode))
         
         })




         
router.post('/labtest/Addbeni',  async  (req, res) => {
  const beniModel = new BenificiariesSchema({
    baniid: GetRandomId(10000, 1000000),
    beniUserId: req.body.beniUserId,
    beniname: req.body.beniname,
    age: req.body.age,
    gender: req.body.gender,
    

  })
  beniModel.save()
  res.json(success("beneficiary Added Successfully", { data: "1" }, res.statusCode))
 
 })
 router.get('/labtest/Getbeni/:beniUserId', async (req, res) => {
  var beniUserId=req.params.beniUserId
  BenificiariesSchema.aggregate([

    { $match: { beniUserId: Number(beniUserId) } },
    
  ]).exec(function (err, students) {

   
    res.json(success("OK", { data: students }, res.statusCode))
  });

})
router.get('/labtest/getOrders/:userId', async (req, res) => {

  const userId = req.params.userId



   try {
    LaborderdetailsSchema.aggregate([
      { $match: { userId: Number(userId) } },

    ]).exec(function (err, students) {


      
      res.json(success("OK", { data: students }, res.statusCode))
    });
  }
  catch (errors) {
    res.json(error(errors.message, res.statusCode))
  } 
});
router.post('/labtest/getOrdersSummary', async (req, res) => {
  const orderId = req.body.orderId
  var providerId=req.body.providerId
      
  var vendorApiKey=req.body.apiKey

  if(providerId==1)
  {
    var config = {
    baseURL: 'https://velso.thyrocare.cloud/api',
     headers: {
'Content-Type': 'application/json'
}
  }
  

   axios.post('/OrderSummary/OrderSummary', { ApiKey:vendorApiKey,OrderNo:orderId},config)
  .then(function (data) {


   if(data.data.respId=="RES00001")
   {


    res.json(success(data.data.response, { data:data.data}, res.statusCode))


   }
   else
   {
    
   res.json(success(data.data.response, { data:data.data}, res.statusCode))
   }

  }
  )
}




 






});


const Agenda = require("agenda");
const mongoString ="mongodb+srv://prateek:V9z1ntUKFeosJLK5@cluster0.aiuci.mongodb.net/proacdoc?retryWrites=true&w=majority";
const agenda = new Agenda({ db: { address: mongoString }});

agenda.define("first push", async (job) => {
 
  console.log("first push initiated")
  try {





    var userTokens = [];

    await UserModel.find({}, { "token": 1, "_id": 0 }).exec(function (err, result) {
      if (err) throw err;
      result.forEach(results => {

        if (typeof results.token === 'undefined') {
          //Variable isn't defined
        }
        else {
          var message = {
            data: {
            
              title:"Healthy lifestyle helps lower ♥ rate ",
              desc: "Walk 30 mins/day and monitor your heart rate for 15 days !",
            


            },


          };
          userTokens.push(results.token)
          console.log("Message Sent")
           FCM.sendToMultipleToken(message, userTokens, function (err, response) {
            if (err) {
              console.log('err--', err);
            } else {
              console.log('response-----', response);
            }

          }) 

        }
      });

    });


  }
  catch (error) {

  }




















});

(async function () {
  // IIFE to give access to async/await
  await agenda.start();

  await agenda.every("1 hours", "first push");


})();


module.exports = router;