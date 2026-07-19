import { Region, SettlementType } from '@app/core';

import data = require('./settlements.json');

const settlements = data as {
  region: string;
  name: string;
  aliases: string[];
  lat: number | null;
  lng: number | null;
  type: string;
}[];

const REGION_MAP = {
  UA71000000000010357: Region.Cherkasy,
  UA74000000000025378: Region.Chernihiv,
  UA73000000000044923: Region.Chernivtsi,
  UA12000000000090473: Region.Dnipropetrovsk,
  UA14000000000091971: Region.Donetsk,
  UA26000000000069363: Region.IvanoFrankivsk,
  UA63000000000041885: Region.Kharkiv,
  UA65000000000030969: Region.Kherson,
  UA68000000000099709: Region.Khmelnytskyi,
  UA35000000000016081: Region.Kirovohrad,
  UA32000000000030281: Region.Kyiv,
  UA44000000000018893: Region.Luhansk,
  UA46000000000026241: Region.Lviv,
  UA48000000000039575: Region.Mykolaiv,
  UA51000000000030770: Region.Odesa,
  UA53000000000028050: Region.Poltava,
  UA56000000000066151: Region.Rivne,
  UA59000000000057109: Region.Sumy,
  UA61000000000060328: Region.Ternopil,
  UA05000000000010236: Region.Vinnytsia,
  UA07000000000024379: Region.Lutsk,
  UA21000000000011690: Region.Uzhhorod,
  UA23000000000064947: Region.Zaporizhzhia,
  UA18000000000041385: Region.Zhytomyr,
  UA01000000000013043: Region.Crimea,
};

const TYPE_MAP = {
  M: SettlementType.CITY,
  X: SettlementType.SETTLEMENT,
  C: SettlementType.VILLAGE,
};

export const SETTLEMENTS = () => {
  return settlements
    .filter((item) => item.lat)
    .map((item) => ({
      region: REGION_MAP[item.region],
      type: TYPE_MAP[item.type],
      name: item.name,
      aliases: item.aliases,
      lat: item.lat,
      lng: item.lng,
    }));
};
