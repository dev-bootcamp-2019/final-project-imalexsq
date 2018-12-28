pragma solidity ^ 0.5 .0;

import 'installed_contracts/zeppelin/contracts/math/SafeMath.sol';

contract Bounty {
    using SafeMath for uint;
    
    address public owner;
    uint public questionCount;
    uint public answerCount;

    constructor() payable public {
        owner = msg.sender;
        questionCount = 0;
        answerCount = 0;
    }

    mapping(uint => Question) public allQuestions;
    mapping(uint => Answer) public allAnswers;

    struct Question {
        uint id;
        string heading;
        string description;
        uint submitDate;
        uint bountyAmount;
        address payable funder;
        address winner;
    }

    struct Answer {
        uint id;
        uint questionId;
        string description;
        uint submitDate;
        bool accepted;
        address payable proposer;
    }

    event questionAdded(uint questionCount);
    event answerAdded(uint id);
    event answerAccepted(uint id);

    modifier isQuestionFunder(uint _id) {
        require(msg.sender == allQuestions[allAnswers[_id].questionId].funder, "Not question funder");_;
    }

    function addQuestion(string memory _heading, string memory _description)
    public
    payable
    returns(
        bool
    ) {
        require(msg.value != 0, "Add a bounty amount");
        require(msg.sender != owner, 'Cannot be owner');


        allQuestions[questionCount] = Question({
            id: questionCount,
            heading: _heading,
            description: _description,
            submitDate: now,
            bountyAmount: msg.value,
            funder: msg.sender,
            winner: address(0)
        });
        emit questionAdded(questionCount);
        questionCount += 1;
        return true;
    }

    function addAnswer(uint _questionId, string memory _description) public returns(bool) {
        allAnswers[answerCount] = Answer({
            id: answerCount,
            questionId: _questionId,
            description: _description,
            submitDate: now,
            accepted: false,
            proposer: msg.sender
        });
        emit answerAdded(answerCount);
        answerCount += 1;
        return true;
    }

    function getQuestion(uint _id) public view returns(
        uint id,
        string memory heading,
        string memory description,
        uint submitDate,
        uint bountyAmount,
        address funder,
        address winner) {
        id = allQuestions[_id].id;
        heading = allQuestions[_id].heading;
        description = allQuestions[_id].description;
        submitDate = allQuestions[_id].submitDate;
        bountyAmount = allQuestions[_id].bountyAmount;
        funder = allQuestions[_id].funder;
        winner = allQuestions[_id].winner;
        return (id, heading, description, submitDate, bountyAmount, funder, winner);
    }

    function getAnswer(uint _id) public view returns(
        uint id,
        uint questionId,
        string memory description,
        uint submitDate,
        bool accepted,
        address proposer
    ) {
        id = allAnswers[_id].id;
        questionId = allAnswers[_id].questionId;
        description = allAnswers[_id].description;
        submitDate = allAnswers[_id].submitDate;
        accepted = allAnswers[_id].accepted;
        proposer = allAnswers[_id].proposer;

        return (id, questionId, description, submitDate, accepted, proposer);
    }

    function acceptAnswer(uint _id) isQuestionFunder(_id) public returns(
        uint id) {
        require(allAnswers[_id].accepted = false, "Answer already accepted") ;
        
        // flip answer to true
        allAnswers[_id].accepted = true;

        // get question bounty amount
        uint bountyAmount = allQuestions[allAnswers[_id].questionId].bountyAmount;

        // record winner in question
        allQuestions[allAnswers[_id].questionId].winner = allAnswers[_id].proposer;

        // award bounty to proposer
        allQuestions[allAnswers[_id].questionId].bountyAmount = 0;
        uint fee = (bountyAmount  * 10) / 100;
        uint amount = bountyAmount - fee;
        address(allAnswers[_id].proposer).transfer(amount);
        emit answerAccepted(id);
        return id;
    }

    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }

}