
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
  uint constant public bigPotFrequency = 10; // how often the big pot occurs
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
    CLV2D c2d;

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

	constructor(address _CLVaddress, address _C2Daddress) public {
    info.clv = Clover(_CLVaddress);
    info.c2d = CLV2D(_C2Daddress);
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
      if(info.potBalance>startingPotSize){
        uint256 available = info.potBalance - startingPotSize;
        uint256 forC2D = available/20; //take 5%
        uint256 playerWinnings = available-forC2D;
        info.users[info.lastPlayer].winnings += playerWinnings;
        info.potBalance -= forC2D;
        info.potBalance -= playerWinnings;
        
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
      uint256 newCLV = info.c2d.sell(c2dBal);
      info.potBalance += newCLV;

      //reinvest c2d dividends
      info.c2d.reinvest();
    }

    info.playsThisRound = 0;
    info.lastPlayer = address(0x0);
    info.roundEndTime = now+2*60;//add 2 mins
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
    uint256 currBal = currentWinnings(msg.sender);
    //check that that we have something
    require(currBal > 0, "Need more than 0CLV in winnings to withdraw");
		info.clv.transfer(msg.sender, currBal);
		info.users[msg.sender].winnings -= currBal;

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
  uint256 wellC2Ddividends,
  uint256 bigPotFreq){
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
    wellC2Dbalance = info.c2d.balanceOf(address(this));
    wellC2Ddividends = info.c2d.dividendsOf(address(this));
    bigPotFreq = bigPotFrequency;
  }

  function bet(uint256 _amount) external gameIsNotOver returns (uint256){
    //_tokens come it with 6 decimals. ie 1 CLV comes in as 1000000
    require(_amount > info.minBet);
    require(info.clv.transferFrom(msg.sender, address(this), _amount));
		info.potBalance += _amount;
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
