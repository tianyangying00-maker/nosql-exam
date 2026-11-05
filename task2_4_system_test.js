const SID = "12403030211";
const A = 2;
const C = 1;
const Stock = 5 + C; // 6
const Buy = 1 + A;   // 3
const examDB = db.getSiblingDB("exam_" + SID);
const bookId = "BOOK-" + SID;
// 1. 订购事务核心函数
function executeOrder(requestId, forceError = false) {
  const session = db.getMongo().startSession();
  session.startTransaction();
  const sessionDb = session.getDatabase("exam_" + SID);
  try {
    const updateResult = sessionDb.inventory.updateOne(
      { _id: bookId, stock: { $gte: Buy } },
      { $inc: { stock: -Buy } }
    );
    if (updateResult.modifiedCount !== 1) {
      throw new Error("库存不足");
    }
    if (forceError) {
      throw new Error("注入异常");
    }
    sessionDb.orders.insertOne({
      _id: requestId,
      bookId: bookId,
      studentId: SID,
      quantity: Buy
    });
    session.commitTransaction();
    return true; // 成功
  } catch (err) {
    session.abortTransaction();
    return false; // 失败
  } finally {
    session.endSession();
  }
}
function resetData(initialStock) {
  examDB.orders.deleteMany({});
  examDB.inventory.updateOne(
    { _id: bookId },
    { $set: { title: "NoSQL 数据库教材", stock: initialStock } },
    { upsert: true }
  );
}

function runScenario(config) {
  // 重置数据
  resetData(config.initStock);

  let successCount = 0;
  let failCount = 0;

  // 执行订购
  for (let i = 1; i <= config.attempts; i++) {
    const reqId = `REQ-${config.code}-${Date.now()}-${i}`;
    const ok = executeOrder(reqId, config.forceError);
    if (ok) successCount++;
    else failCount++;
  }

  // 获取数据库实际最终值
  const finalStock = examDB.inventory.findOne({ _id: bookId }).stock;
  const finalOrders = examDB.orders.countDocuments();

  // 校验是否符合理论预期值
  const isPassed = (
    successCount === config.expectSuccess &&
    failCount === config.expectFail &&
    finalStock === config.expectStock &&
    finalOrders === config.expectOrders
  );

  // 格式化输出题目的 8 项指标
  print(`--------------------------------------------------`);
  print(`（1）场景编号: ${config.code} (${config.name})`);
  print(`（2）初始库存: ${config.initStock}`);
  print(`（3）购买数量: ${Buy}`);
  print(`（4）成功次数: ${successCount}`);
  print(`（5）失败次数: ${failCount}`);
  print(`（6）最终库存: ${finalStock}`);
  print(`（7）最终订单数量: ${finalOrders}`);
  print(`（8）是否通过本人编写的核验: ${isPassed ? "是 (PASS)" : "否 (FAIL)"}`);
}

print("==================== 开始执行系统测试 ====================");

// T1 正常订购
runScenario({
  code: "T1",
  name: "正常订购",
  initStock: Stock,
  attempts: 1,
  forceError: false,
  expectSuccess: 1,
  expectFail: 0,
  expectStock: Stock - Buy,
  expectOrders: 1
});

// T2 库存不足
runScenario({
  code: "T2",
  name: "库存不足",
  initStock: Buy - 1,
  attempts: 1,
  forceError: false,
  expectSuccess: 0,
  expectFail: 1,
  expectStock: Buy - 1,
  expectOrders: 0
});

// T3 中途异常
runScenario({
  code: "T3",
  name: "中途异常",
  initStock: Stock,
  attempts: 1,
  forceError: true,
  expectSuccess: 0,
  expectFail: 1,
  expectStock: Stock,
  expectOrders: 0
});

// T4 连续购买
const t4Attempts = Math.floor(Stock / Buy) + 1; // 6/3 + 1 = 3 次
runScenario({
  code: "T4",
  name: "连续购买",
  initStock: Stock,
  attempts: t4Attempts,
  forceError: false,
  expectSuccess: Math.floor(Stock / Buy), // 2 次
  expectFail: 1,                          // 1 次
  expectStock: Stock % Buy,              // 0
  expectOrders: Math.floor(Stock / Buy)  // 2
});
