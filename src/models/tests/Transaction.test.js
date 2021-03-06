import {assert} from 'chai';
import {Transaction} from '../Transaction';
import {CowriShell} from '../CowriShell';
import {CowriUser} from '../CowriUser';
import {Token} from '../Token';

let senderCowriUser;
let receiverCowriUser;

it("Test that creating a transaction throws an error if the balance isn't enough to cover the tx", () => {
  initializeTestData();
  const constructorFunction = assert.throws(
    () => new Transaction(senderCowriUser, receiverCowriUser, 10000),
  );
});

it('Test isOverlapEnoughToCoverTX returns true if the overlap is enough to cover the balance', () => {
  initializeTestData();
  const transaction = new Transaction(senderCowriUser, receiverCowriUser, 599);
  assert.isTrue(transaction.isOverlapEnoughToCoverTX());
});

it('Test isOverlapEnoughToCoverTX returns true if the overlapped balance is equal to the amount to send', () => {
  initializeTestData();
  const transaction = new Transaction(senderCowriUser, receiverCowriUser, 600);
  assert.isTrue(transaction.isOverlapEnoughToCoverTX());
});

it('Test isOverlapEnoughToCoverTX returns false if the overlap is not enough to cover the balance', () => {
  initializeTestData();
  const transaction = new Transaction(senderCowriUser, receiverCowriUser, 601);
  assert.isFalse(transaction.isOverlapEnoughToCoverTX());
});

it('Test that isTotalBalanceEnoughToCoverTx returns true if it is exactly enough to cover balance', () => {
  initializeTestData();
  const transaction = new Transaction(senderCowriUser, receiverCowriUser, 1000);
  assert.isTrue(transaction.isTotalBalanceEnoughToCoverTX());
});

it('Test that isTotalBalanceEnoughToCoverTx returns true if passed an epsilon and the balance minus epsilon is equal to the amount ', () => {
  initializeTestData();
  const transaction = new Transaction(senderCowriUser, receiverCowriUser, 990);
  assert.isTrue(transaction.isTotalBalanceEnoughToCoverTX(0.01));
});

it('Test that isTotalBalanceEnoughToCoverTx returns false if passed an epsilon and the balance minus epsilon is less than the amount ', () => {
  initializeTestData();
  const transaction = new Transaction(senderCowriUser, receiverCowriUser, 991);
  assert.isFalse(transaction.isTotalBalanceEnoughToCoverTX(0.01));
});

it('Test that isTotalBalanceEnoughToCoverTx returns true if passed an epsilon and the balance minus epsilon is greater than the amount ', () => {
  initializeTestData();
  const transaction = new Transaction(senderCowriUser, receiverCowriUser, 989);
  assert.isTrue(transaction.isTotalBalanceEnoughToCoverTX(0.01));
});

it('Test algorithm with integers: scenario 1 => [0,1,0,0,0,0,0]', () => {
  shellAlgorithmTestScenario(1, [0, 1, 0, 0, 0, 0, 0]);
});

it('Test algorithm with integers: scenario 2 => [0,0,2,0,0,0,0]', () => {
  shellAlgorithmTestScenario(2, [0, 0, 2, 0, 0, 0, 0]);
});

it('Test algorithm with integers: scenario 3 => [0,0,3,0,0,0,0]', () => {
  shellAlgorithmTestScenario(3, [0, 0, 3, 0, 0, 0, 0]);
});

it('Test algorithm with integers: scenario 9 => [0,0,0,0,0,0,9]', () => {
  shellAlgorithmTestScenario(9, [0, 0, 0, 0, 0, 0, 9]);
});

it('Test algorithm with integers: scenario 11 => [0,1,0,0,0,0,10]', () => {
  shellAlgorithmTestScenario(11, [0, 1, 0, 0, 0, 0, 10]);
});

it('Test algorithm with integers: scenario 13 => [0,0,3,0,0,0,10]', () => {
  shellAlgorithmTestScenario(13, [0, 0, 3, 0, 0, 0, 10]);
});

it('Test algorithm with integers: scenario 14 => [0,0,0,0,4,0,10]', () => {
  shellAlgorithmTestScenario(14, [0, 0, 0, 0, 4, 0, 10]);
});

it('Test algorithm with integers: scenario 17 => [0,0,0,0,0,7,10]', () => {
  shellAlgorithmTestScenario(17, [0, 0, 0, 0, 0, 7, 10]);
});

it('Test algorithm with integers: scenario 20 => [0,0,2,0,0,8,10]', () => {
  shellAlgorithmTestScenario(20, [0, 0, 2, 0, 0, 8, 10]);
});

it('Test algorithm with integers: scenario 22 => [0,0,0,0,4,8,10]', () => {
  shellAlgorithmTestScenario(22, [0, 0, 0, 0, 4, 8, 10]);
});

it('Test algorithm with integers: scenario 23 => [0,0,0,0,5,8,10]', () => {
  shellAlgorithmTestScenario(23, [0, 0, 0, 0, 5, 8, 10]);
});

it('Test algorithm with integers: scenario 29 => [0,0,3,3,5,8,10]', () => {
  shellAlgorithmTestScenario(29, [0, 0, 3, 3, 5, 8, 10]);
});

it('Test algorithm with integers: scenario 30 => [0,1,3,3,5,8,10]', () => {
  shellAlgorithmTestScenario(30, [0, 1, 3, 3, 5, 8, 10]);
});

it('Test algorithm with decimals: scenario 1.1 => [0,1.1,0,0,0,0,0]', () => {
  shellAlgorithmDecimalTestScenario(1.1, [0, 1.1, 0, 0, 0, 0, 0]);
});

it('Test algorithm with decimals: scenario 3.3 => [0,0,3.3,0,0,0,0]', () => {
  shellAlgorithmDecimalTestScenario(3.3, [0, 0, 3.3, 0, 0, 0, 0]);
});

it('Test algorithm with decimals: scenario 10.8 => [0,0,0,0,0,0,10.8]', () => {
  shellAlgorithmDecimalTestScenario(10.8, [0, 0, 0, 0, 0, 0, 10.8]);
});

it('Test algorithm with decimals: scenario 4.4 => [0,0,0,0,0,0,4.4]', () => {
  shellAlgorithmDecimalTestScenario(4.4, [0, 0, 0, 0, 4.4, 0, 0]);
});

it('Test algorithm with decimals: scenario 12 => [0,0,1.2,0,0,0,10.8]', () => {
  shellAlgorithmDecimalTestScenario(12, [0, 0, 1.2, 0, 0, 0, 10.8]);
});

it('Test that isVanilla has correct return value', () => {
  initializeTestData();
  const transaction = new Transaction(senderCowriUser, receiverCowriUser, 10);
  assert.isTrue(transaction.isVanilla());
});

it('Test that isIsmael has correct return value', () => {
  initializeTestData();
  const transaction = new Transaction(senderCowriUser, receiverCowriUser, 601);
  assert.isTrue(transaction.isIsmael());
});

let shellAlgorithmTestScenario = (transactionAmount, expectedBalanceArray) => {
  const senderCowriShell = buildIntegerBalanceCowriShell();
  const senderCowriUser = new CowriUser('senderCowriUser', senderCowriShell);
  const receiverCowriShell = buildIntegerBalanceCowriShell();
  const receiverCowriUser = new CowriUser(
    'receiverCowriUser',
    receiverCowriShell,
  );
  const testProtocol = new Transaction(
    senderCowriUser,
    receiverCowriUser,
    transactionAmount,
  );
  const expectedAddressMap = buildExpectedTransferResult(expectedBalanceArray);
  const actualBalanceCowriShell = testProtocol.getCowriShellThatCoversBalance();
  const actualAddressMap = actualBalanceCowriShell.getAddressToValueMap();
  assert.deepEqual(expectedAddressMap, actualAddressMap);
};

let shellAlgorithmDecimalTestScenario = (
  transactionAmount,
  expectedBalanceArray,
) => {
  const senderCowriShell = buildDecimalBalanceCowriShell();
  const senderCowriUser = new CowriUser('senderCowriUser', senderCowriShell);
  const receiverCowriShell = buildDecimalBalanceCowriShell();
  const receiverCowriUser = new CowriUser(
    'receiverCowriUser',
    receiverCowriShell,
  );
  const testProtocol = new Transaction(
    senderCowriUser,
    receiverCowriUser,
    transactionAmount,
  );
  const expectedAddressMap = buildExpectedTransferResult(expectedBalanceArray);
  const actualBalanceCowriShell = testProtocol.getCowriShellThatCoversBalance();
  const actualAddressMap = actualBalanceCowriShell.getAddressToValueMap();
  assert.deepEqual(expectedAddressMap, actualAddressMap);
};

let initializeTestData = () => {
  senderCowriUser = buildSenderCowriUser();
  receiverCowriUser = buildReceiverCowriUser();
};

let buildSenderCowriUser = () => {
  const senderCowriShell = buildSenderCowriShell();
  return new CowriUser('senderCowriUser', senderCowriShell);
};

let buildSenderCowriShell = () => {
  const tokenA = new Token('TokenA', '123', 100);
  const tokenB = new Token('TokenB', 'abc', 200);
  const tokenC = new Token('TokenC', 'ik998df9', 300);
  const tokenD = new Token('TokenD', '98dfkj', 400);
  return new CowriShell([tokenA, tokenB, tokenC, tokenD]);
};

let buildReceiverCowriUser = () => {
  const receiverCowriShell = buildReceiverCowriShell();
  return new CowriUser('receiverCowriUser', receiverCowriShell);
};

let buildReceiverCowriShell = () => {
  const tokenA = new Token('TokenA', '123', 150);
  const tokenB = new Token('TokenB', 'abc', 250);
  const tokenC = new Token('TokenC', 'ik998df9', 350);
  const tokenE = new Token('TokenE', 'kdfjkdjf', 450);
  return new CowriShell([tokenA, tokenB, tokenC, tokenE]);
};

let buildIntegerBalanceCowriShell = () => {
  const tokenA = new Token('TokenA', 'tknA', 0);
  const tokenB = new Token('TokenB', 'tknB', 1);
  const tokenC = new Token('TokenC', 'tknC', 3);
  const tokenD = new Token('TokenD', 'tknD', 3);
  const tokenE = new Token('TokenE', 'tknE', 5);
  const tokenF = new Token('TokenF', 'tknF', 8);
  const tokenG = new Token('TokenG', 'tknG', 10);
  return new CowriShell([
    tokenA,
    tokenB,
    tokenC,
    tokenD,
    tokenE,
    tokenF,
    tokenG,
  ]);
};

let buildDecimalBalanceCowriShell = () => {
  const tokenA = new Token('TokenA', 'tknA', 0);
  const tokenB = new Token('TokenB', 'tknB', 1.1);
  const tokenC = new Token('TokenC', 'tknC', 3.3);
  const tokenD = new Token('TokenD', 'tknD', 3.3);
  const tokenE = new Token('TokenE', 'tknE', 5.5);
  const tokenF = new Token('TokenF', 'tknF', 8.8);
  const tokenG = new Token('TokenG', 'tknG', 10.8);
  return new CowriShell([
    tokenA,
    tokenB,
    tokenC,
    tokenD,
    tokenE,
    tokenF,
    tokenG,
  ]);
};

let buildExpectedTransferResult = expectedTransferValues => ({
  tknA: expectedTransferValues[0],
  tknB: expectedTransferValues[1],
  tknC: expectedTransferValues[2],
  tknD: expectedTransferValues[3],
  tknE: expectedTransferValues[4],
  tknF: expectedTransferValues[5],
  tknG: expectedTransferValues[6],
});
