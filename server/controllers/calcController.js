// server/controllers/calcController.js
const { algorithmOptim } = require('../utils/algorithm');

class CalcController {
    async calculateGraph(req, res) {
        try {
            const { bind, weight, totalNodes } = req.body;

            if (!bind || !weight || !totalNodes) {
                return res.status(400).json({ message: "Некорректные данные" });
            }

            const result = algorithmOptim(bind, weight, totalNodes, 0);

            console.log("Расчет выполнен успешно");
            console.log(result);
            return res.json(result);

        } catch (error) {
            console.error("Ошибка в контроллере:", error);
            return res.status(500).json({ message: "Ошибка сервера при расчете" });
        }
    }
}

module.exports = new CalcController();