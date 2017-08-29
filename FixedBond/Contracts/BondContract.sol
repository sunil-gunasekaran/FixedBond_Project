pragma solidity ^0.4.11; 
contract KYCRegistry{
function isAuthorized(address addr) constant returns (bool);
}

contract BondContract
{
	struct BondData
	{
		uint bondID;
		string bondName;
		uint singleIssuePrice;
		uint interestRate;
		uint repayment;
		uint[] paymentDates;
	}

	struct bondOwnership
	{
		uint bondID;
		address bondOwnerAddr;
		uint numOfBondsOwned;
		uint bondPurchasePrice;
		uint numOfBondsSold;
		uint netBondSoldAmount;
		uint bondSellRate;
		uint numOfBondsToSell;
	}

	uint public bondsSold;
	uint public  bondsAvailable;
	mapping(uint => bondOwnership) bondOwners;
	mapping (address => BondData) public bondData;
	address issuerAddress;
	address KYCRegistryAddress;
    uint bondCount = 0;
	uint numOwnersCount;
	uint BondID;



// Events
event ConfirmationBondSale(address buyer, uint amount, uint valuePaid);
event ConfirmationPayment(address buyer, uint amount, uint valuePaid, uint referenceDate);
event ErrorTransactionMessage(uint reason);
event ErrorNotEnoughBond(uint amount, uint bondsAvailable);
event ErrorNotEnoughMoney(uint amount);
event ConfirmationBondSaleBetweenPrivates(address seller, address buyer, uint amount, uint valuePaid);
event ErrorSpecifyValidCount();
event ErrorMakingPayment(address ownersAddr, uint bondCount, uint paymentAmt, uint paymentDate);
event FundsReceived(address issuer,uint value);
event PaymentsComplete(uint totalPayment, uint paidDate);
event TransferComplete();


function BondContract(string bondName,uint numBondsToIssue, uint[] _paymentDates, uint _singleIssuePrice, uint _interestRate, uint _repayment,address _KYCRegistryAddress) 
{
    bondData[msg.sender] = BondData(1,bondName,_singleIssuePrice,_interestRate,_repayment,_paymentDates);
    bondCount++;
    BondID++;
	bondsAvailable=numBondsToIssue;
	bondsSold=0;
	numOwnersCount=0;
	KYCRegistryAddress = _KYCRegistryAddress;
	issuerAddress = msg.sender;
}

function getBondPrice(uint count, address issuer) public returns (uint)
{
	if(count <=0)
	{
		ErrorSpecifyValidCount();
		return 0;
	}
	if(count > bondsAvailable)
	{
		ErrorNotEnoughBond(count, bondsAvailable);
		return 0;
	}
	uint bondAmount = count * bondData[issuer].singleIssuePrice;
	return bondAmount;
}

function getMyBondCount(address myAddress) constant public returns (uint)
{
	for(uint i = 0; i < numOwnersCount; i++){
		if (bondOwners[i].bondOwnerAddr == myAddress) {
			return bondOwners[i].numOfBondsOwned;
		}
	}
	return 0;
}

function getMyBondDetails(address myAddress) constant public returns (string bondName, uint numBonds,uint purchasePrice,uint maturityAmt,address issuer,uint[3] paymentDates)
{
    for(uint i = 0; i < numOwnersCount; i++)
	{
		if (bondOwners[i].bondOwnerAddr == myAddress)
		{
		    	bondName = bondData[issuerAddress].bondName;
			numBonds  =bondOwners[i].numOfBondsOwned;
			purchasePrice = bondData[issuerAddress].singleIssuePrice;
			maturityAmt = bondData[issuerAddress].repayment;
			issuer = issuerAddress;
			for (uint j=0;j<3;j++)
			{
			    paymentDates[j] = bondData[issuerAddress].paymentDates[j];
			}
			return(bondName,numBonds,purchasePrice,maturityAmt,issuer,paymentDates);
		}
	}
}

function PurchaseBond(uint initAmount, uint noOfBonds) public payable {
	if(msg.value < initAmount)
	{
		ErrorNotEnoughMoney(100);
		return;
	}

	if(noOfBonds != initAmount / bondData[issuerAddress].singleIssuePrice){
		ErrorTransactionMessage(100);
		return;
	}
	
	if(noOfBonds > bondsAvailable){
		ErrorNotEnoughBond(noOfBonds, bondsAvailable);
		return;
	}

	if(!issuerAddress.send(initAmount))
	{
		ErrorTransactionMessage(200);
		return;
	}

	uint foundAddress = 0;
	for(uint i = 0; i < numOwnersCount; i++){
	if (bondOwners[i].bondOwnerAddr == msg.sender) 
	{
		foundAddress = 1;
		bondOwners[i].bondID = bondData[issuerAddress].bondID;
		uint currentBondCount = bondOwners[i].numOfBondsOwned;
		currentBondCount = currentBondCount + noOfBonds;
		bondOwners[i].numOfBondsOwned = currentBondCount;
		bondOwners[i].bondPurchasePrice += initAmount;
		bondsSold += noOfBonds;
		bondsAvailable -= noOfBonds;
	}
	}
	if(foundAddress == 0){
		bondOwners[numOwnersCount].bondOwnerAddr = msg.sender;
		bondOwners[numOwnersCount].numOfBondsOwned = noOfBonds;
		bondOwners[numOwnersCount].bondID = bondData[issuerAddress].bondID;
	    bondOwners[numOwnersCount].bondPurchasePrice += initAmount;
		numOwnersCount++;
		bondsSold += noOfBonds;
		bondsAvailable -= noOfBonds;
	}
	ConfirmationBondSale(bondOwners[numOwnersCount].bondOwnerAddr, noOfBonds, initAmount);
}

function TransferBond(uint bondID,uint noOfBonds, uint unitSellPrice, address receiver) public
{
    uint numBonds;
    bool transferred = false;
    bool received  = false;
    for(uint i = 0; i < numOwnersCount; i++)
	{
		if (bondOwners[i].bondOwnerAddr == msg.sender && bondOwners[i].bondID == bondID)
		{
		    numBonds = bondOwners[i].numOfBondsOwned;
			if(numBonds > noOfBonds && bondOwners[i].numOfBondsToSell > noOfBonds )
			{
			    bondOwners[i].numOfBondsOwned-= noOfBonds;
			    bondOwners[i].numOfBondsToSell-= noOfBonds;
			    bondOwners[i].numOfBondsSold +=noOfBonds;
			    bondOwners[i].netBondSoldAmount+= noOfBonds * unitSellPrice;
		       // bondOwners[i].bondSellRate = unitSellPrice;
		       transferred = true;
			}
		}
		
		if (bondOwners[i].bondOwnerAddr == receiver && bondOwners[i].bondID == bondID )
		{
			bondOwners[i].numOfBondsOwned+= noOfBonds;
			bondOwners[i].bondPurchasePrice += noOfBonds * unitSellPrice;
		    // bondOwners[i].bondSellRate = unitSellPrice;
		    received = true;
		}
	}
	if(transferred && received)
	{
	 TransferComplete();
	 return;
	}
	else if(transferred && !received)
	{
        bondOwners[numOwnersCount].bondOwnerAddr = receiver;
    	bondOwners[numOwnersCount].numOfBondsOwned = noOfBonds;
    	bondOwners[numOwnersCount].bondID = bondData[issuerAddress].bondID;
    	received = true;
    	TransferComplete();
    	return;
    }
}

function getBuyerCount(address myissuerAddress) constant public returns (uint)
{
	return numOwnersCount;
}

function getIssuerBondInfo(address myissuerAddress) constant public returns (string,uint,uint,uint,uint,uint,uint[3])
{
    uint[3] memory paymentDates;
    uint issuePrice = bondData[myissuerAddress].singleIssuePrice;
    uint interestRate = bondData[myissuerAddress].interestRate;
    uint repayment = bondData[myissuerAddress].repayment;
    uint bondID = bondData[myissuerAddress].bondID;
	for (uint j=0;j<3;j++)
	{
	    paymentDates[j] = bondData[issuerAddress].paymentDates[j];
	}
	return (bondData[myissuerAddress].bondName,bondID,issuePrice,interestRate,repayment,bondsAvailable,paymentDates);

}

function getBuyers(address myissuerAddress, uint index) constant public returns (address[50] buyerAddress,uint256[50] bondsOwned,uint)
{
    uint bondID = bondData[myissuerAddress].bondID;
    uint nextIndex;
    uint buyIndex = 0;
    
    for(uint i = index; i < numOwnersCount; i++)
	{
		if (bondOwners[i].bondID == bondID)
		{
			buyerAddress[buyIndex] = bondOwners[i].bondOwnerAddr;
			bondsOwned[buyIndex] = bondOwners[i].numOfBondsOwned;
			buyIndex++;
		}
		nextIndex = i;
	}
	return (buyerAddress,bondsOwned,nextIndex);
}

function IssueFundsForPayment() payable public 
{
	FundsReceived(msg.sender,msg.value);
}


function MakePayments(address sender,uint currentdate) public payable {
    uint index = 0;
	uint leng = bondData[sender].paymentDates.length-1;
	uint totalPayment;

	while (index < leng && bondData[sender].paymentDates[index] == 0)
	{
		index++;
	}

	if(currentdate < bondData[sender].paymentDates[index] || bondData[sender].paymentDates[index] == 0){
		ErrorTransactionMessage(bondData[sender].paymentDates[index]);
		return;
	}
	uint referenceDate = bondData[sender].paymentDates[index];
	bondData[sender].paymentDates[index] = 0;
	for(uint i = 0; i < numOwnersCount; i++)
	{
		uint payment = bondData[sender].interestRate * bondOwners[i].numOfBondsOwned;
		if(index == leng){
			payment += bondData[sender].repayment * bondOwners[i].numOfBondsOwned;
		}
		address bondOwnersAddr = bondOwners[i].bondOwnerAddr;
		if(!bondOwnersAddr.send(payment * 1000000000000000000))
		{
			ConfirmationPayment(bondOwners[i].bondOwnerAddr,0,0, referenceDate);
			throw;
		}
		totalPayment+=payment;
		ConfirmationPayment(bondOwners[i].bondOwnerAddr, bondOwners[i].numOfBondsOwned, payment, referenceDate);
	}
	PaymentsComplete(totalPayment,referenceDate);
	return;
}

}

