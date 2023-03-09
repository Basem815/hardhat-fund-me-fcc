/*We could go into the chainlink repo and find the contract that contains all the pricefeed data that we need
  But this would be cumbersome so instead we can use the node_modules package already included in this directory   */
// SPDC-License-Identifier: MIT

pragma solidity ^0.6.0;


import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";
