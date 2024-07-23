import db from "db";
const tokenService = db.services.tokens;
export default async () => {
  const { results } = await tokenService.aggregate([]);
  return results;
};
