"use server";

export async function globalSearch(query: string) {
  return [
    { title: "Sample search result 1 for " + query, url: "#" },
    { title: "Sample search result 2 for " + query, url: "#" }
  ];
}
