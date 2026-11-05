const SID = "12403030211";
const A = 2;
const Buy = 1 + A; // 3
const examDB = db.getSiblingDB("exam_" + SID);
const bookId = "BOOK-" + SID;

function deductInventory(targetBookId, quantity) {
  try {
   
    const result = examDB.inventory.updateOne(
      {
        _id: targetBookId,
        stock: { $gte: quantity } // 同时筛选教材编号和库存条件
      },
      {
        $inc: { stock: -quantity }
      }
    );

    if (result.acknowledged && result.modifiedCount === 1) {
      // 状态（1）：扣减成功
      print(`[结果-成功] 扣减成功！教材: ${targetBookId}，扣减数量: ${quantity}`);
      return "SUCCESS";
    } else if (result.acknowledged && result.matchedCount === 0) {
      // 状态（2）：库存不足或教材不存在
      print(`[结果-失败] 扣减未执行：库存不足 或 教材不存在！教材: ${targetBookId}`);
      return "INSUFFICIENT_STOCK_OR_NOT_FOUND";
    } else {
      // 未知返回状态
      print(`[结果-异常] 数据库未确认写入：${JSON.stringify(result)}`);
      return "DATABASE_ERROR";
    }
  } catch (error) {
    // 状态（3）：数据库执行异常
    print(`[结果-异常] 数据库执行异常：${error.message}`);
    return "DATABASE_EXCEPTION";
  }
}

// ==================== 测试验证流程 ====================
print("================ 开始测试三种场景 ================");
// 先将库存重置为 6（验证环境）
examDB.inventory.updateOne({ _id: bookId }, { $set: { stock: 6 } });
print("\n--- 场景 1：正常扣减（当前库存 6，扣减 3）---");
deductInventory(bookId, Buy);
print("\n--- 场景 2：再次扣减（当前库存 3，扣减 3）---");
deductInventory(bookId, Buy);
print("\n--- 场景 3：库存耗尽后再次扣减（当前库存 0，尝试扣减 3）---");
deductInventory(bookId, Buy); // 触发“库存不足”
print("\n--- 场景 4：查询不存在的教材编号 ---");
deductInventory("BOOK-NOT-EXIST", Buy); // 触发“教材不存在”
print("\n--- 场景 5：模拟异常操作（如传入非法查询格式）---");
try {
  // 传入非法的更新操作符测试 catch 异常
  examDB.inventory.updateOne({ _id: bookId }, { "$invalidOp": { stock: 1 } });
} catch (e) {
  print(`[结果-异常] 成功捕获数据库异常：${e.message}`);
}
print("\n================ 当前最终库存 ================");
printjson(examDB.inventory.findOne({ _id: bookId }));
