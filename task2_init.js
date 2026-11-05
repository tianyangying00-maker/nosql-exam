const SID = "12403030211";
const C = 1;
const Stock = 5 + C; // 6
const examDB = db.getSiblingDB("exam_" + SID);
examDB.inventory.deleteMany({});
examDB.orders.deleteMany({});
examDB.inventory.insertOne({
  _id: "BOOK-" + SID,
  title: "NoSQL 数据库教材",
  stock: Stock
});
print("=== 第二题环境初始化完成，当前库存: " + Stock + " ===");
