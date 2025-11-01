import Complaint from "../models/Complaint";
import Announcement from "../models/Announcement";
import User from "../models/User";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getOverviewStatistics = async () => {
  const [totalComplaints, totalActiveAnnouncements, totalResidents] =
    await Promise.all([
      Complaint.countDocuments(),
      Announcement.countDocuments({ status: "published" }),
      User.countDocuments({ user_type: "resident" }),
    ]);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const complaintsPerMonthRaw = await Complaint.aggregate([
    { $match: { created_at: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { year: { $year: "$created_at" }, month: { $month: "$created_at" } },
        count: { $sum: 1 },
      },
    },
    { $project: { year: "$_id.year", month: "$_id.month", count: 1, _id: 0 } },
    { $sort: { year: 1, month: 1 } },
  ]);

  const announcementsPerMonthRaw = await Announcement.aggregate([
    { $match: { status: "published", created_at: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { year: { $year: "$created_at" }, month: { $month: "$created_at" } },
        count: { $sum: 1 },
      },
    },
    { $project: { year: "$_id.year", month: "$_id.month", count: 1, _id: 0 } },
    { $sort: { year: 1, month: 1 } },
  ]);

  const usersPerMonthRaw = await User.aggregate([
    { $match: { user_type: "resident", createdAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $project: { year: "$_id.year", month: "$_id.month", count: 1, _id: 0 } },
    { $sort: { year: 1, month: 1 } },
  ]);

  const buildLast12Months = () => {
    const result: { key: string; label: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      result.push({ key, label: MONTHS[d.getMonth()] });
    }
    return result;
  };
  const monthsWindow = buildLast12Months();
  const complaintsMap = new Map(
    complaintsPerMonthRaw.map((i: any) => [`${i.year}-${i.month}`, i.count])
  );
  const complaintsPerMonth = monthsWindow.map((m) => ({
    month: m.label,
    count: complaintsMap.get(m.key) || 0,
  }));

  const announcementsMap = new Map(
    announcementsPerMonthRaw.map((i: any) => [`${i.year}-${i.month}`, i.count])
  );
  const announcementsPerMonth = monthsWindow.map((m) => ({
    month: m.label,
    count: announcementsMap.get(m.key) || 0,
  }));

  const usersMap = new Map(
    usersPerMonthRaw.map((i: any) => [`${i.year}-${i.month}`, i.count])
  );
  const usersPerMonth = monthsWindow.map((m) => ({
    month: m.label,
    count: usersMap.get(m.key) || 0,
  }));

  const complaintsBySitioAgg = await Complaint.aggregate([
    { $lookup: { from: "users", localField: "resident_id", foreignField: "_id", as: "resident" } },
    { $unwind: { path: "$resident", preserveNullAndEmptyArrays: true } },
    { $addFields: { sitioFromComplaint: "$sitio_code" } },
    { $addFields: { sitioFromResidentRaw: "$resident.address_sitio" } },
    {
      $addFields: {
        sitioDigits: {
          $regexFind: { input: { $toString: "$sitioFromResidentRaw" }, regex: /\d+/ },
        },
      },
    },
    {
      $addFields: {
        sitioFromResident: {
          $convert: { input: "$sitioDigits.match", to: "int", onError: null, onNull: null },
        },
      },
    },
    {
      $addFields: {
        sitioNumber: { $ifNull: ["$sitioFromComplaint", "$sitioFromResident"] },
      },
    },
    { $group: { _id: "$sitioNumber", count: { $sum: 1 } } },
    { $project: { sitio: "$_id", count: 1, _id: 0 } },
  ]);

  const countsMap = new Map<number, number>();
  let unspecifiedCount = 0;
  for (const row of complaintsBySitioAgg) {
    if (row.sitio === null || row.sitio === undefined || Number.isNaN(row.sitio)) {
      unspecifiedCount += row.count || 0;
    } else {
      countsMap.set(row.sitio as number, row.count || 0);
    }
  }
  // Map counts to existing sitios by name
  const existingSitios = await (await import('../models/Sitio')).default.find({}).sort({ code: 1 }).select('code name');
  const complaintsBySitio = existingSitios.map((s: any) => ({ sitio: s.name, count: countsMap.get(s.code) || 0 }));
  if (unspecifiedCount > 0) complaintsBySitio.push({ sitio: "Unspecified", count: unspecifiedCount });
  
  console.log('Complaints by sitio aggregation result:', complaintsBySitio);

  const complaintsByCategory = await Complaint.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { category: "$_id", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  return {
    totalComplaints,
    totalActiveAnnouncements,
    totalResidents,
    complaintsPerMonth,
    announcementsPerMonth,
    usersPerMonth,
    complaintsBySitio,
    complaintsByCategory,
  };
};
