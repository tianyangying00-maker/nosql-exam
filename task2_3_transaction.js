const SID = "12403030211";
const A = 2;
const Buy = 1 + A; // 每次购买 3 本
const examDB = db.getSiblingDB("exam_" + SID);
const bookId = "BOOK-" + SID;
function orderBook(requestId, forceError = false) {
  // 1. 开启客户端会话和事务
  const session = db.getMongo().startSession();
  session.startTransaction();
  const sessionDb = session.getDatabase("exam_" + SID);
  try {
    // 步骤一：原子条件扣减库存（要求：使用同一会话及事务）
    const updateResult = sessionDb.inventory.updateOne(
      {
        _id: bookId,
        stock: { $gte: Buy }
      },
      {
        $inc: { stock: -Buy }
      }
    );

    // 要求(2)：扣减失败时不得生成订单
    if (updateResult.modifiedCount !== 1) {
      throw new Error(`库存不足或教材不存在，扣减失败（要求购买: ${Buy}）`);
    }

    // 要求：forceError = true 时，库存扣减成功后、订单插入前主动抛出异常
    if (forceError) {
      throw new Error("【主动抛出异常】模拟订单生成前系统故障/网络中断！");
    }

    // 步骤二：向 orders 集合插入订单记录
    sessionDb.orders.insertOne({
      _id: requestId,
      bookId: bookId,
      studentId: SID,
      quantity: Buy
    });

    // 要求(3)：正常执行时提交事务
    session.commitTransaction();

    // 要求(5)：只有事务提交成功后，才返回订购成功
    print(`\n>>> [事务提交成功] requestId: ${requestId} 订购成功！`);
    return { success: true, requestId: requestId, message: "订购成功" };

  } catch (error) {
    // 要求(4)：出现异常时回滚事务
    session.abortTransaction();
    print(`\n>>> [事务已回滚] requestId: ${requestId} 执行失败，原因: ${error.message}`);
    return { success: false, requestId: requestId, message: error.message };

  } finally {
    // 释放会话资源
    session.endSession();
  }
}

// ==================== 测试验证两组场景 ====================
// 测试前重置库存为 6，清空订单
examDB.inventory.updateOne({ _id: bookId }, { $set: { stock: 6 } });
examDB.orders.deleteMany({});
print("=== 测试前初始状态 ===");
print("当前库存: " + examDB.inventory.findOne({ _id: bookId }).stock);
print("订单数量: " + examDB.orders.countDocuments());
// 场景 1：forceError = true（测试事务回滚）
print("\n----------------- 场景 1：测试异常回滚 -----------------");
orderBook("REQ-12403030211-ERR01", true);
print("\n[回滚后核验] 当前库存应保持为 6，订单数应为 0：");
printjson(examDB.inventory.findOne({ _id: bookId }));
print("orders 集合记录数: " + examDB.orders.countDocuments());
// 场景2：forceError = false（测试正常提交）
print("\n----------------- 场景 2：测试正常提交 -----------------");
orderBook("REQ-12403030211-OK01", false);
print("\n[提交后核验] 当前库存应变为 3，订单数应为 1：");
printjson(examDB.inventory.findOne({ _id: bookId }));
printjson(examDB.orders.find().toArray());
