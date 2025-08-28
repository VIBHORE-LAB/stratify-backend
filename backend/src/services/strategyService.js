import db from "../models/index.js";
import { runBacktest } from "../cengine/runner.js";
import { computePctChange } from "../utils/resultParser.js";


const {Strategy, BackTestResult, Trade} = db;

export async function runStrategyForUser({userId, strategyName, params, dataPath, io}) {
    const strat = await Strategy.create({userId, name: strategyName, params: JSON.stringify(params)});;
    const emitter = runBacktest(dataPath, strategyName, params);

    const tradesBuffer = [];
    emitter.on('trade', async(t) =>{
        tradesBuffer.push(t);
        io.to(userId).emit('trade', t);
    });

    emitter.on('order', (o) => io.to(userId).emit('order',0));




    return new Promise((resolve, reject)=>{
        emitter.on('done', async (final)=>{
            const startingNav = 100000;
            const finalNav = Number(final.final_nav);
            const pctChange = computePctChange(finalNav, startingNav);

            const result = await BackTestResult.create({
                userId,
                strategyId: strat.id,
                finalNav,
                pctChange,
                cash: final.cash,
                position: final.position,
                navFile: 'out_nav.csv',
                tradesFile: 'out_trades.csv'
            })


            if(tradesBuffer.length){
                await Trade.bulkCreate(
                    tradesBuffer.map(tr =>({
                        resultId: result.id,
                        orderId: tr.order_id,
                        side: tr.side,
                        price: tr.price,
                        qty: tr.qty ?? tr.quantity,
                        timestamp: tr.timestamp
                    }))
                );
            }




            io.to(userId).emit('backtest_complete',{
                resultId: result.id,
                finalNav,
                pctChange
            });

            resolve(result);




        });

        emitter.on('error', reject);
    });


  



}
  export async function listResults(userId, {limit = 50, offset = 0} = {}){
        return db.BackTestResult.findAndCountAll({
            where: {userId},
            include: [{model: db.Strategy , attributes: ['name', 'params']}],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
    }


  export async function getResultDetail(userId, resultId){
    const result = await db.BackTestResult.findOne({
        where: {id: resultId, userId},
        include:[
            {model: db.Strategy, attributes: ['name', 'params']},
            {model: db.Trade, order: [['timestamp', 'ASC']]}
        ]
    });
    return result;
  }

 