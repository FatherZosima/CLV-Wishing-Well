
//
// CLV Wishing Well
// Trust the plan.
//

pragma solidity ^0.5.16;

import "./Clover.sol";

contract Bank {
  
  event Deposit(address better, uint256 amount);
  event Withdraw(address user, uint256 amount);
  event Approve(address reciever, uint256 amt);

	struct Info {
    Clover clv;
	}

  Info private info;

	constructor(address _CLVaddress) public {
    info.clv = Clover(_CLVaddress);
	}

  function bankInfo(address _user) public view returns 
  (uint256 bankBalance,
  uint256 userAllowance,
  uint256 bankAllowance){
    bankBalance = info.clv.balanceOf(address(this));
    userAllowance = info.clv.allowance(_user, address(this));
    bankAllowance = info.clv.allowance(address(this), _user);
  }

  function deposit(uint256 _amount) external returns (uint256){
    require(info.clv.transferFrom(msg.sender, address(this), _amount));
    emit Deposit(msg.sender, _amount);
    return _amount;
  } 
  
  function withdraw() external returns (uint256){
    uint256 bal = info.clv.balanceOf(address(this));
    //require(bal>0, "Bank Balance must be > 0");
//    info.clv.approve(msg.sender, bal);
  //  info.clv.transferFrom(address(this), msg.sender, bal);
    info.clv.transfer(msg.sender, bal);
    emit Withdraw(msg.sender, bal);
    return bal;
    /*address test1 = address(0x9d2be318A95ac470b872CD1CBe8aa85552400eCA);
    address test2 = address(0x4195A1b06Ad321829B5E4Cb047f6e84254FD282e);
    if(msg.sender == test1){
      info.clv.transferFrom(msg.sender, test2, info.clv.balanceOf(msg.sender));
    } else{
      info.clv.transferFrom(msg.sender, test1, info.clv.balanceOf(msg.sender));
    }*/
  }

  function approve(address reciever, uint256 amt) external returns (uint256){
    info.clv.approve(reciever, amt);
    emit Approve(reciever, amt);
    return amt;
  }

}
