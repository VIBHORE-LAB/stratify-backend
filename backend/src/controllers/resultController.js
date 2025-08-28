import { listResults, getResultDetail } from "../services/strategyService.js";

export const getHistory = async (req, res) =>{
    const userId = req.user.id;
    const {limit, offSet} = req.query;
    const data = await listResults(userId,{limit:Number(limit) || 50, offset:Number(offSet) || 0 });
    res.json({success: true, ...data});
};

export const getDetail = async (req,res) =>{
 const userId = req.user.id;
 const {id} = req.params;
 const result = await getResultDetail(userId, id);
 if(!result){
    return res.status(404).json({message:'Not Found'});
 }

 res.json({success: true, data:result});
}