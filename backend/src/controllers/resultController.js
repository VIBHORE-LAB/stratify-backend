import { get } from "http";
import { listResults, getResultDetail, getTotalCount,getLatest,getAverageWinRate } from "../services/strategyService.js";

export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, offset } = req.query;

    const data = await listResults(userId, {
      limit: Number(limit) || 500,
      offset: Number(offset) || 0,
    });

    res.status(200).json({
      success: true,
      count: data.count,
      rows: data.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch results history",
    });
  }
};

export const getDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await getResultDetail(userId, id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch result details",
    });
  }
};

export const getCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await getTotalCount(userId);

    res.status(200).json({
      success: true,
      totalBacktests: total,
    }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch total backtests count",
    });
  }
};


export const getLatestResult = async(req,res) =>{
  try{
    const userId = req.user.id;
    const total = await getLatest(userId);
    res.status(200).json({
      success: true,
      totalBacktests: total,
    }); 

  }

  catch(err){
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest backtests",
    });
  }
}



export const fetchAverageWinRate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { average, bestStrategy } = await getAverageWinRate(userId);

    res.status(200).json({
      success: true,
      averageWinRate: average,
      bestStrategy,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch average win rate",
    });
  }
};
