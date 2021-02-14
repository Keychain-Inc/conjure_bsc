// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "./lib/FixedPoint.sol";

contract BnbConjure is IERC20, ReentrancyGuard {

    /// @notice using Openzeppelin contracts for SafeMath and Address
    using SafeMath for uint256;
    using Address for address;
    using FixedPoint for FixedPoint.uq112x112;
    using FixedPoint for FixedPoint.uq144x112;

    /// @notice presenting the total supply
    uint256 private _totalSupply;

    /// @notice representing the name of the token
    string private _name;

    /// @notice representing the symbol of the token
    string private _symbol;

    /// @notice representing the decimals of the token
    uint8 private immutable _decimals = 18;

    /// @notice a record of balance of a specific account by address
    mapping(address => uint256) private _balances;

    /// @notice a record of allowances for a specific address by address to address mapping
    mapping(address => mapping(address => uint256)) private _allowances;

    /// @notice the owner and creator of the contract
    address payable public _owner;

    /// @notice the owner of the CONJURE factory
    address payable public _factoryowner;

    /// @notice the type of the arb asset (single asset, arb asset) (0... single, 1... arb)
    uint8 public _assetType;

    /// @notice the address of the collateral contract factory
    address public _collateralFactory;

    /// @notice the address of the collateral contract
    address public _collateralContract;

    /// @notice shows the init state of the contract
    bool public _inited;

    /// @notice struct for oracles
    struct _oracleStruct {
        address oracleaddress;
        /// 0... chainlink 2... custom
        uint oracleType;
        string signature;
        bytes calldatas;
        uint256 weight;
        uint256 decimals;
        uint256 values;
    }

    /// @notice array for oracles
    _oracleStruct[] public _oracleData;

    /// @notice number of aracles
    uint256 public _numoracles;

    /// @notice the latest observed price
    uint256 public _latestobservedprice;

    /// @notice the latest observed price timestamp
    uint256 public _latestobservedtime;

    /// @notice maximum decimal size for the used prices
    uint256 public _maximumDecimals = 18;

    /* The number representing 1.0. */
    uint public  UNIT = 10**uint(_maximumDecimals);

    constructor (
        string memory name_,
        string memory symbol_,
        address payable owner_,
        address payable factoryowner_,
        address collateralfactory_
    )
    public {
        _owner = owner_;
        _factoryowner = factoryowner_;
        _totalSupply = 0;
        _name = name_;
        _symbol = symbol_;

        _collateralFactory = collateralfactory_;

        _balances[_owner] = _totalSupply;
        _inited = false;

        emit Transfer(address(0), _owner, _totalSupply);
    }

    /**
    * @dev Public init function to set up the contract with pricing sources
    *
    */
    function init(
        uint256 mintingFee_,
        uint8 assetType_,
        address[] memory oracleAddresses_,
        uint8[] memory oracleTypes_,
        string[] memory signatures_,
        bytes[] memory calldata_,
        uint256[] memory values_,
        uint256[] memory weights_,
        uint256[] memory decimals_
    ) public
    {
        require(msg.sender == _owner);
        require(_inited == false);

        _collateralContract = IBnbCollateralFactory(_collateralFactory).BnbCollateralMint(payable(address(this)), _owner, _factoryowner, mintingFee_);
        _assetType = assetType_;
        _numoracles = oracleAddresses_.length;

        // push the values into the oracle struct for further processing
        for (uint i = 0; i < oracleAddresses_.length; i++) {
            _oracleStruct memory temp_struct;
            temp_struct.oracleaddress = oracleAddresses_[i];
            temp_struct.oracleType = oracleTypes_[i];
            temp_struct.signature = signatures_[i];
            temp_struct.calldatas = calldata_[i];
            temp_struct.weight = weights_[i];
            temp_struct.values = values_[i];
            temp_struct.decimals = decimals_[i];
            _oracleData.push(temp_struct);

            require(decimals_[i] <= 18);
        }

        getPrice();
        _inited = true;
    }

    /**
    * @dev Public burn function can only be called from the collateral contract
    *
    */
    function burn(address account, uint amount) public
    {
        require(msg.sender == _collateralContract);
        _internalBurn(account, amount);
    }

    /**
    * @dev Public mint function can only be called from the collateral contract
    *
    */
    function mint(address account, uint amount) public
    {
        require(msg.sender == _collateralContract);
        _internalIssue(account, amount);
    }

    /**
    * @dev internal mint function issues tokens to the given account
    *
    */
    function _internalIssue(address account, uint amount) internal {
        _balances[account] = _balances[account].add(amount);
        _totalSupply = _totalSupply.add(amount);

        emit Transfer(address(0), account, amount);
        emit Issued(account, amount);
    }

    /**
    * @dev internal burn function burns tokens from the given account
    *
    */
    function _internalBurn(address account, uint amount) internal {
        _balances[account] = _balances[account].sub(amount);
        _totalSupply = _totalSupply.sub(amount);

        emit Transfer(account, address(0), amount);
        emit Burned(account, amount);
    }

    /**
     * @dev lets the owner change the owner
     */
    function changeOwner(address payable _newOwner) public {
        require(msg.sender == _owner);
        address oldOwner = _owner;
        _owner = _newOwner;
        emit NewOwner(oldOwner, _owner);
    }

    /**
     * @dev Lets the Factory Owner change the current owner
     */
    function newFactoryOwner(address payable _newOwner) public {
        require(msg.sender == _factoryowner);
        _factoryowner = _newOwner;
    }

    /**
     * @dev lets the owner collect the collected fees
     */
    function collectFees() public {
        require(msg.sender == _owner);
        uint256 contractBalalance = address(this).balance;

        _owner.transfer(contractBalalance);
    }

    /**
    * Returns the latest price of an oracle asset
    */
    function getLatestPrice(AggregatorV3Interface priceFeed) internal view returns (int) {
        (
        uint80 roundID,
        int price,
        uint startedAt,
        uint timeStamp,
        uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }

    /**
     * Gets the BNB USD price from band oracle
    */
    function getLatestBNBUSDPrice() public view returns (int) {

        address contractaddress = 0xDA7a001b254CD22e46d3eAB04d937489c93174C3;
        IBandOracle oracle = IBandOracle(contractaddress);
        IBandOracle.ReferenceData memory ref = oracle.getReferenceData("BNB", "USD");
        return int(ref.rate);
    }

    /**
    * quicksort implementation
    */
    function quickSort(uint[] memory arr, int left, int right) public pure {
        int i = left;
        int j = right;
        if (i == j) return;
        uint pivot = arr[uint(left + (right - left) / 2)];
        while (i <= j) {
            while (arr[uint(i)] < pivot) i++;
            while (pivot < arr[uint(j)]) j--;
            if (i <= j) {
                (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            quickSort(arr, left, j);
        if (i < right)
            quickSort(arr, i, right);
    }

    /**
    * Avg implementation
    */
    function getAverage(uint[] memory arr) internal view returns (uint) {
        uint sum = 0;

        for (uint i = 0; i < arr.length; i++) {
            sum += arr[i];
        }

        // if we dont have any weights
        if (_assetType == 0)
        {
            return (sum / arr.length);
        }

        // divide by total weight
        return (sum / 100);
    }

    /**
    * Sort Function
    */
    function sort(uint[] memory data) public pure returns (uint[] memory) {
        quickSort(data, int(0), int(data.length - 1));
        return data;
    }

    // sqrt function
    function sqrt(uint256 y) internal view returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = (y + 1) / 2;
            while (x < z) {
                z = x;
                x = (y.mul(UNIT).div(x) + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
        // else z = 0
    }

    function getLatestPrice() public view returns (uint) {
        return _latestobservedprice;
    }

    /**
    * Returns the price for the arb asset (median price of the 5 assets)
    */
    function getPrice() public returns (uint) {

        // storing all in an array for further processing
        uint[] memory prices = new uint[](_oracleData.length);

        for (uint i = 0; i < _oracleData.length; i++) {

            // chainlink oracle
            if (_oracleData[i].oracleType == 0)
            {
                AggregatorV3Interface pricefeed = AggregatorV3Interface(_oracleData[i].oracleaddress);
                uint price = uint(getLatestPrice(pricefeed));
                prices[i] = price;

                // norming price
                if (_maximumDecimals != _oracleData[i].decimals)
                {
                    prices[i] = prices[i] * 10 ** (_maximumDecimals - _oracleData[i].decimals);
                }

                if (_assetType == 1)
                {
                    prices[i] = prices[i] * _oracleData[i].weight;
                }
            }

            // custom oracle
            if (_oracleData[i].oracleType == 2)
            {
                address contractaddress = _oracleData[i].oracleaddress;
                string memory signature = _oracleData[i].signature;
                bytes memory calldatas = _oracleData[i].calldatas;
                uint256 callvalue = _oracleData[i].values;

                bytes memory callData;

                if (bytes(signature).length == 0) {
                    callData = calldatas;
                } else {
                    callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), calldatas);
                }

                (bool success, bytes memory data) = contractaddress.call{value:callvalue}(callData);
                require(success);

                uint  price = abi.decode(data, (uint));
                prices[i] = price;

                // norming price
                if (_maximumDecimals != _oracleData[i].decimals)
                {
                    prices[i] = prices[i] * 10 ** (_maximumDecimals - _oracleData[i].decimals);
                }

                if (_assetType == 1)
                {
                    prices[i] = prices[i] * _oracleData[i].weight;
                }
            }
        }

        uint[] memory sorted = sort(prices);

        /// for single assets return median
        if (_assetType == 0)
        {
            uint modulo = sorted.length % 2;

            // uneven so we can take the middle
            if (modulo == 1)
            {
                uint sizer = (sorted.length + 1) / 2;

                _latestobservedprice = sorted[sizer-1];
                _latestobservedtime = block.timestamp;
                return sorted[sizer-1];
            }
            // take average of the 2 most inner numbers
            else
            {
                uint size1 = (sorted.length) / 2;
                uint size2 = size1 + 1;

                uint arrsize1 = sorted[size1-1];
                uint arrsize2 = sorted[size2-1];

                uint[] memory sortedmin = new uint[](2);
                sortedmin[0] = arrsize1;
                sortedmin[1] = arrsize2;

                _latestobservedprice = getAverage(sortedmin);
                _latestobservedtime = block.timestamp;
                return getAverage(sortedmin);
            }
        }

        /// else return avarage for arb assets
        _latestobservedprice = getAverage(sorted);
        _latestobservedtime = block.timestamp;

        return getAverage(sorted);
    }

    ///
    /// ERC20 specific functions
    ///

    /**
    * fallback function for collection funds
    */
    fallback() external payable {

    }

    receive() external payable {

    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5,05` (`505 / 10 ** 2`.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }

    /**
    * @dev See {IERC20-totalSupply}.
    */
    function totalSupply() public override view returns (uint256) {
        return _totalSupply;
    }

    /**
    * @dev See {IERC20-balanceOf}. Uses burn abstraction for balance updates without gas and universally.
    */
    function balanceOf(address account) public override view returns (uint256) {
        return _balances[account];
    }

    /**
    * @dev See {IERC20-transfer}.
    *
    * Requirements:
    *
    * - `recipient` cannot be the zero address.
    * - the caller must have a balance of at least `amount`.
    */
    function transfer(address dst, uint256 rawAmount) external override returns (bool) {
        uint256 amount = rawAmount;
        _transfer(msg.sender, dst, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender)
    public
    override
    view
    returns (uint256)
    {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount)
    public
    override
    returns (bool)
    {
        _approve(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20};
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero ress.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for ``sender``'s tokens of at least
     * `amount`.
     */
    function transferFrom(address src, address dst, uint256 rawAmount) external override returns (bool) {
        address spender = msg.sender;
        uint256 spenderAllowance = _allowances[src][spender];
        uint256 amount = rawAmount;

        if (spender != src && spenderAllowance != uint256(-1)) {
            uint256 newAllowance = spenderAllowance.sub(amount, "CONJURE::transferFrom: transfer amount exceeds spender allowance");
            _allowances[src][spender] = newAllowance;
        }

        _transfer(src, dst, amount);
        return true;
    }


    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner`s tokens.
     *
     * This is internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        _balances[sender] = _balances[sender].sub(
            amount,
            "BRC20: transfer amount exceeds balance"
        );
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    // ========== EVENTS ==========
    event NewOwner(address oldOwner, address newOwner);
    event FeeChanged(uint8 oldFee, uint8 newFee);
    event Issued(address indexed account, uint value);
    event Burned(address indexed account, uint value);
}

contract BnbConjureFactory {
    event NewConjureContract(address deployed);
    event FactoryOwnerChanged(address newowner);
    address payable public factoryOwner;

    constructor() public {
        factoryOwner = msg.sender;
    }

    /**
     * @dev lets anyone mint a new CONJURE contract
     */
    function ConjureMint(
        string memory name_,
        string memory symbol_,
        address payable owner_,
        address collateralfactory_
    ) public returns(address) {
        BnbConjure newContract = new BnbConjure(
            name_,
            symbol_,
            owner_,
            factoryOwner,
            collateralfactory_
        );
        emit NewConjureContract(address(newContract));
        return address(newContract);
    }

    /**
     * @dev Lets the Factory Owner change the current owner
     */
    function newFactoryOwner(address payable newOwner) public {
        require(msg.sender == factoryOwner);
        factoryOwner = newOwner;
        emit FactoryOwnerChanged(factoryOwner);
    }
}

interface IBnbCollateralFactory {
    function BnbCollateralMint(address payable asset_, address owner_, address payable factoryowner_, uint256 mintingfeerate_) external returns (address);
}

interface IBandOracle {
    struct ReferenceData {
        uint256 rate; // base/quote exchange rate, multiplied by 1e18.
        uint256 lastUpdatedBase; // UNIX epoch of the last time when base price gets updated.
        uint256 lastUpdatedQuote; // UNIX epoch of the last time when quote price gets updated.
    }

    /// Returns the price data for the given base/quote pair. Revert if not available.
    function getReferenceData(string calldata _base, string calldata _quote)
    external
    view
    returns (ReferenceData memory);
}
