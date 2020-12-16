
//
// CLV Wishing Well
// Trust the plan.
//

pragma solidity ^0.5.16;

import "./Clover.sol";
import "./CLV2D.sol";

contract WishingWell {
  uint256 constant private startingPotSize = 1000000; //pot must always start with 1
  uint256 constant private skimPercent = 20; //skim 5% of winnins to put into C2D (100/20 == 5)
  uint constant public bigPotFrequency = 10; // how often the big pot occurs
  uint constant private minute = 10; //60 seconds in a minute

	event Bet(address better, uint256 amount, uint256 potBalance);
  event Withdraw(address user, uint256 amount);
  event StartNextRound(uint256 roundNumber, uint256 startingPot);
	
  struct User {
		uint256 winnings;
	}

	struct Info {
    Clover clv;
    CLV2D c2d;

		mapping(address => User) users;
    address lastPlayer;
    address lastWinner;
    uint256 minBet;
    uint256 roundEndTime;
    uint256 roundNumber;
    uint256 playsThisRound;
    uint256 heldWinnings;
	}

  modifier gameIsOver {require(now >= info.roundEndTime); _; }
  modifier gameIsNotOver {require(now < info.roundEndTime); _; }
  modifier greaterThanZero(uint256 amount) {require(amount>0, "Must be > 0"); _;}
  
  Info private info;

	constructor(address _CLVaddress, address _C2Daddress) public {
    info.clv = Clover(_CLVaddress);
    info.c2d = CLV2D(_C2Daddress);
    
    info.lastWinner = address(0x0);
    info.lastPlayer = address(0x0);
    info.roundEndTime = 0;
    info.heldWinnings = 0;
	}

  function calcMinBet() internal view returns (uint256){
    uint256 newMin = getPotBalance()/100; //min bet is 1% of current Pot
    if(newMin<=info.minBet){//in case where the minimumBet hasn't grown
      newMin = info.minBet+1;
    }
    return newMin;
  }

  //get current balance (winnings of a user)
  function currentWinnings(address _user) public view returns (uint256){
    return info.users[_user].winnings;
  }

  function  getPotBalance() internal view returns (uint256){
    return (info.clv.balanceOf(address(this)) - info.heldWinnings);
  }

  function withdrawWinnings() external returns (uint256){
    uint256 currBal = currentWinnings(msg.sender);
    //check that that we have something
    require(currBal > 0, "Need more than 0CLV in winnings to withdraw");
		info.clv.transfer(msg.sender, currBal);
		info.users[msg.sender].winnings -= currBal;
    info.heldWinnings -= currBal;

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
  uint256 userWinnings,
  uint256 wellC2Dbalance,
  uint256 bigPotFreq,
  uint256 wellCLVLiquidBalance){
    potBalance = getPotBalance();
    roundNumber = info.roundNumber;
    playsThisRound = info.playsThisRound;
    roundEndTime = info.roundEndTime;
    minBet = info.minBet;
    lastPlayer = info.lastPlayer;
    lastWinner = info.lastWinner;
    wellBalance = info.clv.balanceOf(address(this));
    userAllowance = info.clv.allowance(_user, address(this));
    userWinnings = currentWinnings(_user);
    wellC2Dbalance = info.c2d.balanceOf(address(this));
    wellCLVLiquidBalance = info.c2d.calculateResult(wellC2Dbalance, false, false);
    bigPotFreq = bigPotFrequency;
  }

  function bet(uint256 _amount) public gameIsNotOver returns (uint256){
    //_tokens come it with 6 decimals. ie 1 CLV comes in as 1000000
    require(_amount >= info.minBet);
    require(info.clv.transferFrom(msg.sender, address(this), _amount));
    info.playsThisRound += 1;
    if(msg.sender == info.lastPlayer){
      info.roundEndTime += 1*minute;//add 1 min if they just played
    } else{
      info.roundEndTime += 5*minute;//add 5 mins if they did not just play
    }
    info.minBet = calcMinBet();
    info.lastPlayer = msg.sender;
		emit Bet(msg.sender, _amount, getPotBalance());
    return _amount;
  } 

  function startNextRound(uint256 _bet) external gameIsOver returns(uint256){
    //first need to clean up last round
    if(info.playsThisRound>0){//if any bets were played
      if(getPotBalance()>startingPotSize){
        uint256 available = getPotBalance() - startingPotSize;
        uint256 forC2D = available/20; //take 5%
        uint256 playerWinnings = available-forC2D;
        info.users[info.lastPlayer].winnings += playerWinnings;
        info.heldWinnings += playerWinnings;
        
        //transfer to c2d
        if(forC2D>0 && ((info.roundNumber+1) % bigPotFrequency != 0)){
          info.clv.approve(address(info.c2d), forC2D);
          info.c2d.buy(forC2D);
        }
      }
    }//else dont modify pot or users winnings.
    info.lastWinner = info.lastPlayer;

    //start next round
    info.roundNumber++;
    //fill pot with c2d
    if(info.roundNumber%bigPotFrequency == 0){
      //sell all c2d
      uint256 c2dBal = info.c2d.balanceOf(address(this));
      info.c2d.sell(c2dBal);
      //reinvest c2d dividends
      info.c2d.reinvest();
    }

    info.playsThisRound = 0;
    info.lastPlayer = address(0x0);
    info.roundEndTime = now+2*60;//add 2 mins
    info.minBet = 222222; //always start with a minbet of 0.222222
    emit StartNextRound(info.roundNumber, getPotBalance());

    //now place inital bet
    return(bet(_bet));
  }

}