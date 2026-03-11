import Graph from '../models/graph.js';
import User from "../models/user.js";

const createGraph = async (req, res) => {
    try {
        const { name, nodes, edges, resultData } = req.body;

        if (!name || !nodes || !edges) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const graph = new Graph({
            user: req.user.id,
            name,
            nodes,
            edges,
            resultData
        });

        await graph.save();
        res.status(201).json(graph);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGraphs = async (req, res) => {
    try {
        const graphs = await Graph.find({ user: req.user.id })
            .select('name createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json(graphs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGraphById = async (req, res) => {
    try {
        const graph = await Graph.findOne({ _id: req.params.id, user: req.user.id });

        if (!graph) {
            return res.status(404).json({ message: 'Graph not found' });
        }

        res.status(200).json(graph);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteGraph = async (req, res) => {
    try {
        const graph = await Graph.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!graph) {
            return res.status(404).json({ message: 'Graph not found' });
        }

        res.status(200).json({ message: 'Graph deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    createGraph,
    getGraphs,
    getGraphById,
    deleteGraph
};