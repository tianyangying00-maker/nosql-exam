const SID = "12403030211";
const examDB = db.getSiblingDB("exam_" + SID);
const courseId = "COURSE-" + SID + "-01";
const course = examDB.courses.findOne({ _id: courseId });
const ch02 = course.chapters.find(c => c.chapterId === "CH02");
const ch02Title = ch02 ? ch02.title : "未找到";
// 2. 统计 CH03 的数量
const ch03Count = course.chapters.filter(c => c.chapterId === "CH03").length;
// 3. 统计最终章节总数
const totalChapters = course.chapters.length;
// 4. 检查 teacher 和 status 是否保持原值
// 初始值为：teacher: "张老师", status: "OPEN"
const isTeacherOriginal = (course.teacher === "张老师");
const isStatusOriginal = (course.status === "OPEN");
const isOriginal = isTeacherOriginal && isStatusOriginal;
// 打印核验结果
print("==================== 核验结果 ====================");
print(`(1) 修改后 CH02 的标题: ${ch02Title}`);
print(`(2) 两次新增操作后 CH03 的数量: ${ch03Count}`);
print(`(3) 最终章节总数: ${totalChapters}`);
print(`(4) teacher 和 status 是否保持原值: ${isOriginal ? "是" : "否"} (teacher: '${course.teacher}', status: '${course.status}')`);
print("==================================================");
