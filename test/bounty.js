var Bounty = artifacts.require('Bounty');

contract('Bounty', function(accounts) {
  const owner = accounts[0];
  const billy = accounts[1];
  const dusty = accounts[2];
  const frank = accounts[3];

  var id;
  const bountyAmount = '100';

  // Create a sample question and check the proper information is saved to the blockchain
  it('should add a first question', async () => {
    const bounty = await Bounty.deployed();

    var eventEmitted = false;
    const heading = 'ZZ Top';
    const description = 'When was ZZ Top formed?';

    const tx = await bounty.addQuestion(heading, description, {
      from: billy,
      value: bountyAmount
    });

    if (tx.logs[0].event === 'questionAdded') {
      id = tx.logs[0].args.questionCount.toString(10);
      eventEmitted = true;
    }

    const result = await bounty.getQuestion.call(id);

    assert.equal(result[1], heading, 'question heading should match');
    assert.equal(result[4], bountyAmount, 'wei send to contract as a bounty');
    assert.equal(
      eventEmitted,
      true,
      'adding a question should emit a questionAdded event'
    );
    assert.equal(result[5], billy, 'question submitted by billy');
  });

  // Add a second question and check the proper ID is added and the rest of the information is properly saved to the blockchain
  it('should add a second question', async () => {
    const bounty = await Bounty.deployed();

    var eventEmitted = false;
    const heading = 'Billy Gibbons';
    const description = 'When was Billy Gibbons born?';

    const tx = await bounty.addQuestion(heading, description, {
      from: frank,
      value: bountyAmount
    });

    if (tx.logs[0].event === 'questionAdded') {
      secId = tx.logs[0].args.questionCount.toString(10);
      eventEmitted = true;
    }

    const result = await bounty.getQuestion.call(secId);
    assert.equal(secId, 1, 'contract assigns correct id');
    assert.equal(result[1], heading, 'question heading should match');
    assert.equal(result[4], bountyAmount, 'wei send to contract as a bounty');
    assert.equal(
      eventEmitted,
      true,
      'adding a question should emit a questionAdded event'
    );
    assert.equal(result[5], frank, 'question submitted by frank');
  });

  // Add first answer from another account to the first question and check information is saved properly
  it('should add an answer to an existing question', async () => {
    const bounty = await Bounty.deployed();

    var eventEmitted = false;
    const description = 'Was formed in 1969';

    const tx = await bounty.addAnswer(id, description, {
      from: dusty
    });
    if (tx.logs[0].event === 'answerAdded') {
      eventEmitted = true;
    }
    const result = await bounty.getAnswer.call(0);

    assert.equal(
      eventEmitted,
      true,
      'adding a question should emit a answerAdded event'
    );
    assert.equal(result[2], description, 'answer should match');
    assert.equal(result[5], dusty, 'answer submitted by dusty');
  });

  // Add a second answer to the first question from a different account
  it('should add a second answer', async () => {
    const bounty = await Bounty.deployed();

    var eventEmitted = false;
    const description = 'Was formed in 2020';

    const tx = await bounty.addAnswer(id, description, {
      from: frank
    });

    if (tx.logs[0].event === 'answerAdded') {
      eventEmitted = true;
    }
    const result = await bounty.getAnswer.call(1);

    assert.equal(
      eventEmitted,
      true,
      'adding a question should emit a answerAdded event'
    );
    assert.equal(result[2], description, 'answer should match');
    assert.equal(result[5], frank, 'answer submitted by frank');
  });

  // Test question funder can accept an answer and the bounty is awarded properly
  it('should accept the 1st answer', async () => {
    const bounty = await Bounty.deployed();

    var dustyBalanceBefore = await web3.eth.getBalance(dusty);

    var eventEmitted = false;

    const tx = await bounty.acceptAnswer(0, { from: billy });
    if (tx.logs[0].event === 'answerAccepted') {
      eventEmitted = true;
    }
    const result = await bounty.getAnswer.call(0);
    var dustyBalanceAfter = await web3.eth.getBalance(dusty);

    assert.equal(
      eventEmitted,
      true,
      'accepting a question should emit an answerAccepted event'
    );
    assert.equal(result[5], dusty, 'dusty gets awarded the bounty');
    assert.equal(result[4].toString(), 2, 'answer is accepted');
    assert.equal(
      parseInt(dustyBalanceAfter),
      parseInt(dustyBalanceBefore, 10) + parseInt(bountyAmount, 10),
      'dusty receives the bounty'
    );
  });

  // Check that 10% is kept in the contract to fund further operations
  it('should show 10% added to contract balance + 2nd question bounty', async () => {
    const bounty = await Bounty.deployed();

    const result = await bounty.getContractBalance();

    assert.equal(
      result.words[0],
      100 + (bountyAmount * 10) / 100,
      'keeps 10% + 2nd question bounty'
    );
  });
});
