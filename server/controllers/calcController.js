// server/controllers/calcController.js
const { algorithmOptim } = require('../utils/algorithm');

class CalcController {
    async calculateGraph(req, res) {
        try {
            const { bind, weight, totalNodes } = req.body;

            if (!bind || !weight || !totalNodes) {
                return res.status(400).json({ message: "Некоректні дані" });
            }

            const result = algorithmOptim(bind, weight, totalNodes, 0);

            console.log("Розрахунок виконаний успішно");
            console.log(result);
            return res.json(result);

        } catch (error) {
            console.error("Помилка в контролері:", error);
            return res.status(500).json({ message: "Помилка сервера при розрахунку" });
        }
    }
}

module.exports = new CalcController();