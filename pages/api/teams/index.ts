import { NextApiRequest, NextApiResponse } from "next";

/*
  Örnek: gerçek projede bu dosya Prisma Client ile DB'den çekecek.
  Burada örnek statik veri döndürüyoruz.
*/

const sample = [
  { id: "team_1", name: "Kırmızı Kartallar", shortName: "KK", country: "TR", marketValue: 1200000 },
  { id: "team_2", name: "Mavi Fırtına", shortName: "MF", country: "SE", marketValue: 900000 }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ teams: sample });
}