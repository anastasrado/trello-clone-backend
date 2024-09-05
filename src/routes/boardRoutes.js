const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardControllers');

router.get('/', boardController.getAllBoards);
router.get('/:id', boardController.getBoard);
router.post('/', boardController.createBoard);
router.put('/:id', boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);
router.get('/:id/tasks', boardController.getBoardTasks);

module.exports = router;