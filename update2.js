const SID = "12403030211"; 
const S = 11;              
const examDB = db.getSiblingDB("exam_" + SID);
const courseId = "COURSE-" + SID + "-01";
const newTitle = "Redis 基础与应用-" + S; 
// 1. 执行局部更新
const updateResult = examDB.courses.updateOne(
  {
    _id: courseId,
    "chapters.chapterId": "CH02"   // 定位到 CH02 这一项
  },
  {
    $set: {
      "chapters.$.title": newTitle  // 使用 $ 占位符仅更新匹配章节的 title
    }
  }
);

// 2. 输出更新结果
print("========== 1. 更新操作结果 ==========");
printjson(updateResult);

// 3. 查询并输出更新后的完整课程文档
print("\n========== 2. 更新后的课程文档 ==========");
const updatedDoc = examDB.courses.findOne({ _id: courseId });
printjson(updatedDoc);
