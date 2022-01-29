// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Color is ERC721 {
    string[] public colors;
    mapping(string => bool) colorExists;

    constructor() ERC721("0xFriends", "0XF") {}

    function mint(string memory _color) public {
        require(!colorExists[_color],"Error, color already exists");

        colors.push(_color);
        uint256 _id = colors.length;

        _mint(msg.sender, _id);

        colorExists[_color] = true;
    }

    function totalSupply() public view returns (uint256) {
        return colors.length;
    }
}
