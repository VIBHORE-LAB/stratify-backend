import { runStrategyForUser } from "../services/strategyService.js";

export const runStrategy = async (req,res) =>{
    const userId = req.user.id;
    const {strategyName, params, dataPath} = req.body;

    if(!strategyName || !params || !dataPath){
        return res.status(400).json({message:"Strategy Name, Params, Data Path are required"});
    }

    try{
        const io = req.app.get('io');
        const result = await runStrategyForUser({userId, strategyName, params, dataPath, io});
        res.json({success: true, resultId: result.id});
    }


    catch(e){
        res.status(500).json({success: false, message: e.message});
    }
}