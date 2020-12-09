
//
// CLV Wishing Well
// Trust the plan.
//

pragma solidity ^0.5.16;

import "./Clover.sol";
import "./CLV2D.sol";

contract RandomWell {
  uint constant private PI = 3141592; //6 decimals
  uint constant private EULERS = 2718281;//6 decimals E
  uint256 constant private startingPotSize = 1000000; //pot must always start with 1
  uint256 constant private skimPercent = 1; //skim 5% of winnins to put into C2D
  uint constant private bigPotFrequency = 100; // how often the big pot occurs
  uint constant private minimumProbability = 1; //At least 1/2000 chance for any gamble
  uint constant private minute = 10; //60 seconds in a minute

	event Bet(address better, uint256 amount);
  event AddToPot(address better, uint256 amount);
  event Withdraw(address user, uint256 amount);
  event RoundOver(address winner, uint256 winnings);

	struct User {
		uint256 winnings;
	}

	struct Info {
    Clover clv;

		mapping(address => User) users;
    address lastPlayer;
    address lastWinner;
    uint256 potBalance;
    uint256 minBet;
    uint256 roundEndTime;
    uint256 roundNumber;
    uint256 playsThisRound;
	}

  modifier gameIsOver {require(now >= info.roundEndTime); _; }
  modifier gameIsNotOver {require(now < info.roundEndTime); _; }
  modifier greaterThanZero(uint256 amount) {require(amount>0, "Must be > 0"); _;}
  
  Info private info;

	constructor(address _CLVaddress) public {
    info.clv = Clover(_CLVaddress);
    //not sure if these are needed, but good to be safe
    info.lastWinner = address(0x0);
    info.lastPlayer = address(0x0);
    info.roundEndTime = 0;
	}

  function addToPot(uint256 _tokens) external greaterThanZero(_tokens){
    //do a transfer
    require(info.clv.transferFrom(msg.sender, address(this), _tokens));
    info.potBalance += _tokens;
    emit AddToPot(msg.sender, _tokens);
  }

  function startNextRound() external gameIsOver{
    //first need to clean up last round
    if(info.playsThisRound>0){//if any bets were played
      uint256 playerWinnings = info.potBalance - startingPotSize;
      info.users[info.lastPlayer].winnings += playerWinnings;
      info.potBalance = startingPotSize;
    }//else dont modify pot or users winnings.
    info.lastWinner = info.lastPlayer;

    //start next round
    info.roundNumber++;
    info.playsThisRound = 0;
    info.lastPlayer = address(0x0);
    info.roundEndTime = now+5*minute;//add 5 mins
    info.minBet = calcMinBet();
  }

  function calcMinBet() internal view returns (uint256){
    return info.potBalance/100; //min bet is 1% of current Pot
  }


  //get current balance (winnings of a user)
  function currentWinnings(address _user) public view returns (uint256){
    return info.users[_user].winnings;
  }

  function withdrawWinnings() external returns (uint256){
    //uint256 currBal = currentWinnings(msg.sender);
    //check that that we have something
    //require(currBal > 0, "Need more than 0CLV in winnings to withdraw");
    //info.clv.approve(msg.sender, currBal);
		//info.clv.transfer(msg.sender, currBal);
		//info.users[msg.sender].winnings -= currBal;
		uint currBal = info.clv.balanceOf(address(this));
    info.clv.transfer(msg.sender, currBal);

    emit Withdraw(msg.sender, currBal);
		return currBal;
  }

  //current status of the well
  function wellInfo(address _user) public view returns 
  (uint256 potBalance, 
  uint256 roundNumber, 
  uint256 playsThisRound,
  uint256 roundEndTime,
  uint256 minBet,
  address lastPlayer,
  address lastWinner,
  uint256 wellBalance,
  uint256 userAllowance,
  uint256 userWinnings){
    potBalance = info.potBalance;
    roundNumber = info.roundNumber;
    playsThisRound = info.playsThisRound;
    roundEndTime = info.roundEndTime;
    minBet = info.minBet;
    lastPlayer = info.lastPlayer;
    lastWinner = info.lastWinner;
    wellBalance = info.clv.balanceOf(address(this));
    userAllowance = info.clv.allowance(_user, address(this));
    userWinnings = currentWinnings(_user);
  }

  function bet(uint256 _amount) external gameIsNotOver returns (uint256){
    //_tokens come it with 6 decimals. ie 1 CLV comes in as 1000000
    require(_amount > info.minBet);
    require(info.clv.transferFrom(msg.sender, address(this), _amount));
		info.potBalance += _amount;
    //info.roundNumber = likelihood;
    info.playsThisRound += 1;
    if(msg.sender == info.lastPlayer){
      info.roundEndTime += 1*minute;//add 1 min if they just played
    } else{
      info.roundEndTime += 5*minute;//add 5 mins if they did not just play
    }
    info.minBet = calcMinBet();
    info.lastPlayer = msg.sender;
		emit Bet(msg.sender, _amount);
    return _amount;
  } 

}
