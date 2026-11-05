const SID = "12403030211";
const examDB = db.getSiblingDB("exam_" + SID);

examDB.courses.aggregate([
  {
    $match: {
      teacher: "张老师",
      status: "OPEN"
    }
  },
  {
    $project: {
      _id: 1,
      title: 1,
      chapterCount: { $size: "$chapters" }
    }
  }
]);
