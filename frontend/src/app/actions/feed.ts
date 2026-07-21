"use server";

export async function getUnifiedFeed(filters: any) {
  // Mock items
  return [
    { id: "1", title: "Activity 1", type: "activity", department: filters.department || "Unknown" },
    { id: "2", title: "Activity 2", type: "activity", department: filters.department || "Unknown" },
  ];
}
