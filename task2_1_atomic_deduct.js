const SID = "12403030211";
const A = 2;
const Buy = 1 + A; // 3
const examDB = db.getSiblingDB("exam_" + SID);
const bookId = "BOOK-" + SID;
// 单文档原子更新操作
const result = examDB.inventory.updateOne(
  {
    _id: bookId,
    stock: { $gte: Buy }  // 要求(1): 同时筛选编号和库存条件 (库存必须 >= 购买量)
  },
  {
    $inc: { stock: -Buy } // 要求(1)(3): 原子扣减，不使用先查后扣
  }
);

print("========== 1. 原子扣减执行结果 ==========");
printjson(result);
// 判断是否扣减成功
if (result.modifiedCount === 1) {
  print(`✅ 扣减成功！本次扣减数量: ${Buy}`);
} else {
  print("❌ 扣减失败：库存不足，未执行扣减！"); // 要求(2): 库存不足时不扣减
}
// 打印扣减后的库存文档
print("\n========== 2. 当前库存最新文档 ==========");
printjson(examDB.inventory.findOne({ _id: bookId }));
