const SID = "12403030211";
const A = 2; 
const examDB = db.getSiblingDB("exam_" + SID);
const courseId = "COURSE-" + SID + "-01";
// 待插入的新章节数据
const newChapter = {
  chapterId: "CH03",
  title: "Redis 高级操作",
  hours: 2 + A // 即 4
};
// 定义一次新增操作（使用条件查询防止重复 + $push 追加）
function addChapter() {
  return examDB.courses.updateOne(
    {
      _id: courseId,
      "chapters.chapterId": { $ne: newChapter.chapterId } // 关键：只有不存在 CH03 时才匹配
    },
    {
      $push: {
        chapters: newChapter
      }
    }
  );
}
// 1. 第一次执行新增
print("========== 第一次执行新增 ==========");
const result1 = addChapter();
printjson(result1);
// 2. 第二次连续执行新增（验证防重复）
print("\n========== 第二次执行新增 ==========");
const result2 = addChapter();
printjson(result2);
// 3. 查询并展示最终课程文档（验证 CH03 只出现一次）
print("\n========== 最终课程文档 ==========");
const finalDoc = examDB.courses.findOne({ _id: courseId });
printjson(finalDoc);
