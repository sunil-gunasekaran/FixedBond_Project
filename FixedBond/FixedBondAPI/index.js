var express = require('express')
var ipfsAPI = require('ipfs-api')
var multer = require('multer')
var util = require('util')
var path=require('path')
var fs = require('fs')
var bodyparser = require ('body-parser')
var Web3 = require('web3')
var mime = require("mime");
var config = require('config');

var app = express()
//var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');
var router = express.Router();
var BondContract = require('./BondContract.js')
var KYCRegistry = require('./KYCRegistry.js')

var bondContractAddr =  BondContract.ContractAddress();
var bytecode = '0x' + BondContract.ByteCode();
var ABI = BondContract.ContractABI();

var kycRegistryAddr = KYCRegistry.ContractAddress();
var kycbytecode = '0x' + KYCRegistry.KYCByteCode();
var kycABI = KYCRegistry.KYCABI();


if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8001"));
}


var bondinstance = web3.eth.contract(ABI).at(bondContractAddr);
var kycinstance = web3.eth.contract(kycABI).at(kycRegistryAddr)



var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname,'./imagesPath/'));
  },
  filename: function (req, file, callback) {
    var ext = file.originalname.split('.').pop();
    callback(null,file.originalname);
  }
});

var upload = multer({ storage: storage})
var jsonparser = bodyparser.json();
app.set("json spaces",0);
app.use(express.static(__dirname+"/imagesPath"));
app.use(express.static(__dirname+"/downloads"));


//Simple implementation of logging to both console and log file by overwriting the console.log function.
//For production implementation, use Winston.
var log_file = fs.createWriteStream(config.get('logpath'), {flags : 'a'});
var log_stdout = process.stdout;
console.log = function(d) { 
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");  
});


//set defaults:
var const_gas = 4700000;
var const_gasMultiplierFactor = 1;


app.get('/Admin/MyBalance',jsonparser,function (req,res)
{

  var address = req.query.address;
  var balance = web3.fromWei(web3.eth.getBalance(address),"ether");
  res.send(balance);
});

//Create the KYC Registry Contract
app.post('/Admin/KYC',function (req,res){

  var kycregistrycontract = web3.eth.contract(kycABI);
  kycinstance = kycregistrycontract.new(
     {
       from: web3.eth.accounts[0],
       data: kycbytecode,
       gas: const_gas
     }, function (err, registry){
      
      if(err)
          console.log(err);
      if(registry.address)
      {
        console.log(registry);
        if (typeof registry.address !== 'undefined') {
          kycRegistryAddr = registry.address;
          console.log('KYC Registry Created! address: ' + registry.address + ' transactionHash: ' + registry.transactionHash);
          res.json({KYRegistry: kycRegistryAddr});
        }
      }
   })
  });

//Create Bond Contract
app.post('/Issuer/Bond',jsonparser,function (req,res){

  var bondsCount = req.body.BondsToIssue;
  var unitPrice = req.body.UnitPrice;
  var interestRate = req.body.InterestRate;
  var maturityAmt = req.body.MaturityAmount;
  var issuerAddress = req.body.address;
  var bondName = req.body.BondName;

  var date1 = req.body.PaymentDate1;
  var date2 = req.body.PaymentDate2;
  var date3 = req.body.PaymentDate3;
  var paymentDates = ConvertPaymentDates(date1,date2,date3);

  var bond = web3.eth.contract(ABI);
  bondinstance = bond.new(bondName,
    bondsCount,paymentDates,unitPrice,interestRate,maturityAmt,kycRegistryAddr,
     {
       from:issuerAddress,
       data: bytecode,
       gas: const_gas
     }, function (err, bond){
        if(err)
            console.log(err);
        if(bond.address)
        {
          if (typeof bond.address !== 'undefined') {
            bondContractAddr = bond.address;
            console.log('Fixed Bond Price contract has been issued at address: ' + bond.address + ' transactionHash: ' + bond.transactionHash);
            res.json({BondContract: bondContractAddr});
          }
        }
   })

});

app.get('/Issuer/GetMyBuyers',function (req,res){

  var issueraddress = req.query.address;
  var buyerInfo = new Array();
  var buyer;
  var buyerCount = bondinstance.getBuyerCount.call(issueraddress);
  var buyerIndex = 0;
  var result;
  while(buyerIndex < buyerCount)
  {
      result= bondinstance.getBuyers.call(issueraddress,buyerIndex);  
      for(var i=0;i<parseInt(result[2]+1);i++)
      {
        buyer = {Buyer: result[0][i],BondCount: parseInt(result[1][i])}; 
        buyerInfo.push(buyer);
      }
      buyerIndex = parseInt(result[2])+1;
     
  }
  res.setHeader('content-type', 'application/javascript');
  res.send(buyerInfo);
});

app.get('/Issuer/GetBondInfo',function (req,res){

  var address = req.query.address;
  var result = bondinstance.getIssuerBondInfo.call(address);
  var firstDate, secondDate, finalDate;
  var bondInfo;
  console.log(result[6][0]);
  console.log(result[6][1]);
  if(result[1]>0)
  {
    if(parseInt(result[6][0]))
    {
      firstDate = new Date(parseInt(result[6][0])).toDateString();
    }
    else
    {
      firstDate="Paid";
    }

    if(parseInt(result[6][1]))
    {
      secondDate = new Date(parseInt(result[6][1])).toDateString();
    }
    else
    {
      secondDate = "Paid"
    }
    if(parseInt(result[6][2]))
    {
      finalDate = new Date(parseInt(result[6][2])).toDateString();
    }
    else
    {
      finalDate = "Paid";
    }


    bondInfo = {BondName:result[0],BondId:result[1],IssuePrice:result[2],InterestRate:result[3],Repayment:result[4],AvailableBonds:result[5],FirstPayment:firstDate
                ,SecondPayment:secondDate,FinalPayment:finalDate};
   }
  res.setHeader('content-type', 'application/javascript');
  res.send(bondInfo);

});


//Send Money for Payments
app.post('/Issuer/TransferFunds',jsonparser,function (req,res){

  var payment = req.body.payment;
  var issuerAddress = req.body.address;
  var transactionObject = {
        data: bytecode,
        from: issuerAddress,
        to: bondContractAddr,
        value: web3.toWei(payment,"ether"),
        gasPrice: web3.eth.gasPrice,
        gas: const_gas
  };
  web3.eth.estimateGas(transactionObject, function(err, estimateGas){
  if(!err)
    transactionObject.gas = estimateGas * const_gasMultiplierFactor;
    bondinstance.IssueFundsForPayment.sendTransaction(transactionObject, function(e,result){
    var fundsReceivedEvent = bondinstance.FundsReceived(); 
    if(e){
      console.log(e)
      res.status(500).send(e.toString()); 
    }
    else
    {
      fundsReceivedEvent.watch(function(error, output) {
      if(output.args.value > 0) {
        fundsReceivedEvent.stopWatching();
        res.json({"issuer":output.args.issuer, "FundValue" : output.args.value});
        res.end();
        }
        else{
          fundsReceivedEvent.stopWatching();
          res.status(500).send("No data returned");                
        }
      });
    }
    })
  })
 
    
});

//Pay money for the matured bonds.
app.post('/Issuer/MakePayment',jsonparser,function (req,res){

  var issuer = req.body.address;
  var currdate = new Date().setHours(0,0,0,0);

  var transactionObject = {
        data: bytecode,
        from: issuer,
        gasPrice: web3.eth.gasPrice,
        gas: const_gas
  };
  web3.eth.estimateGas(transactionObject, function(err, estimateGas){
  if(!err)
    transactionObject.gas = estimateGas * const_gasMultiplierFactor;
    bondinstance.MakePayments.sendTransaction(issuer,currdate,transactionObject, function(e,result){
    var errorEvent = bondinstance.ErrorTransactionMessage();
    var paymentsEvent = bondinstance.PaymentsComplete(); 
    if(e){
      console.log(e)
      res.status(500).send(e.toString()); 
    }
    else
    {
      errorEvent.watch(function (error,output)
      {
        console.log(currdate);
        console.log(output);
        errorEvent.stopWatching();
        res.status(500).send(e.toString()); 
      }) 
      paymentsEvent.watch(function(error, output) {
      if(parseInt(output.args.totalPayment)>0) {
        paymentsEvent.stopWatching();
        res.json({"FundValue" : output.args.totalPayment,"PaidDate":new Date(parseInt(output.args.paidDate)).toDateString()});
        }
        else{
          paymentsEvent.stopWatching();
          res.status(500).send("No data returned");                
        }
      });
    }
    })
  })
    
});

//Buyer Purchase Bond screen
app.get('/Buyer/GetUnitPrice',function (req,res){

  var count = req.query.bondscount;
  var issuerAddress = req.query.issuer;
  var result = bondinstance.getBondPrice.call(count,issuerAddress);
  res.json({ Count:count,Price:result})
    
});

app.get('/Buyer/CheckPayments',function (req,res){
  
  var buyer = req.query.buyerAddress;
  var paymentEvent = bondinstance.ConfirmationPayment();
  paymentEvent.watch(function(error, output) {
    if(output)
    {
      if(output.args.buyer==buyer)
      {
        paymentEvent.stopWatching();
        res.json({"buyer":output.args.buyer, "BondsCount" : output.args.amount,"PurchaseValue" : output.args.valuePaid, "Date":output.args.referenceDate});
      }
    }
  });
});


//Buyer Purchase Bond Action
app.post('/Buyer/PurchaseBond',jsonparser,function (req,res){

  var buyerAddress = req.body.address;
  var noOfBonds = req.body.NumOfBonds;
  var initAmount = req.body.Amount;
  
  var transactionObject = {
        data: bytecode,
        from: buyerAddress,
        value: web3.toWei(initAmount,"ether"),
        gasPrice: web3.eth.gasPrice,
        gas: const_gas
  };
  web3.eth.estimateGas(transactionObject, function(err, estimateGas){
  if(!err)
    transactionObject.gas = estimateGas * const_gasMultiplierFactor;
    bondinstance.PurchaseBond.sendTransaction(initAmount,noOfBonds,transactionObject, function(e,result){
    var saleEvent = bondinstance.ConfirmationBondSale(); 
    if(e){
      console.log(e)
      res.status(500).send(e.toString()); 
    }
    else
    {
      saleEvent.watch(function(error, output) {
      if(output.args.buyer.length > 0) {
        saleEvent.stopWatching();
        res.json({"buyer":output.args.buyer, "NumOfBonds" : output.args.amount,"PurchaseValue" : output.args.valuePaid});
        res.end();
        }
        else{
          saleEvent.stopWatching();
          res.status(500).send("No data returned");                
        }
      });
    }
    })
  })
    
});

//Buyer Get the Bond Information
app.get('/Buyer/MyHoldings',function (req,res){

  var address = req.query.address;
  var result = bondinstance.getMyBondDetails.call(address);
  var bondInfo = {BondName:result[0],Bonds:result[1],PurchasePrice:result[2],MaturityAmt:result[3],Issuer:result[4],FirstPayment:new Date(parseInt(result[5][0])).toDateString()
                ,SecondPayment:new Date(parseInt(result[5][1])).toDateString(),FinalPayment:new Date(parseInt(result[5][2])).toDateString()};
  res.setHeader('content-type', 'application/javascript');
  res.send(bondInfo);

});

function ConvertPaymentDates(date1,date2,date3)
{
  var dates = [new Date(date1).setHours(0,0,0,0),new Date(date2).setHours(0,0,0,0),new Date(date3).setHours(0,0,0,0)];                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  return dates;   
}

app.listen(7000, function () {

console.log('Node server started!')
});
