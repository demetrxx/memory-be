import { Region } from '@app/core';

type MapCounts = {
  deceased: number;
  items: number;
  memories: number;
};

export type IRegionMapData = Record<
  Region,
  {
    weight: number;
    counts: MapCounts;
  }
>;

export const RegionCounts: Record<Region, [number, number, number]> = {
  [Region.Kyiv]: [100, 1000, 200],
  [Region.Kharkiv]: [80, 800, 160],
  [Region.Lviv]: [60, 600, 120],
  [Region.Odesa]: [70, 700, 140],
  [Region.Zaporizhzhia]: [50, 500, 100],
  [Region.Dnipropetrovsk]: [55, 550, 110],
  [Region.Donetsk]: [10, 100, 20],
  [Region.Luhansk]: [8, 80, 16],
  [Region.Mykolaiv]: [6, 60, 12],
  [Region.Vinnytsia]: [4, 40, 8],
  [Region.IvanoFrankivsk]: [2, 20, 4],
  [Region.Ternopil]: [1, 10, 2],
  [Region.Zhytomyr]: [3, 30, 6],
  [Region.Kirovohrad]: [5, 50, 10],
  [Region.Lutsk]: [7, 70, 14],
  [Region.Kherson]: [9, 90, 18],
  [Region.Khmelnytskyi]: [11, 110, 22],
  [Region.Cherkasy]: [13, 130, 26],
  [Region.Chernihiv]: [15, 150, 30],
  [Region.Chernivtsi]: [17, 170, 34],
  [Region.Rivne]: [19, 190, 38],
  [Region.Sumy]: [21, 210, 42],
  [Region.Poltava]: [23, 230, 46],
  [Region.Uzhhorod]: [25, 250, 50],
  [Region.Crimea]: [27, 270, 54],
};

export function getWeightFromCounts(
  deceased: number,
  items: number,
  memories: number,
): number {
  // weight  = (items_count × 0.6) + (deceased_count × 0.3) + (memories_count × 0.1)
  return items * 0.6 + deceased * 0.3 + memories * 0.1;
}

export const mockRegionMapData = Object.fromEntries(
  Object.values(Region).map((region) => [
    region,
    {
      weight: getWeightFromCounts(...RegionCounts[region]),
      counts: {
        deceased: RegionCounts[region][0],
        items: RegionCounts[region][1],
        memories: RegionCounts[region][2],
      },
    },
  ]),
) as IRegionMapData;
