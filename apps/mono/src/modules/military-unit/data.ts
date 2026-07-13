import {
  MilitaryUnitBranch,
  MilitaryUnitEchelon,
  MilitaryUnitName,
  MilitaryUnitNameType,
  MilitaryUnitSpecialization,
} from '@app/core';

export interface MilitaryUnit {
  number?: number;
  echelon: MilitaryUnitEchelon;
  specialization?: MilitaryUnitSpecialization;
  branch: MilitaryUnitBranch;
  isSeparate?: boolean;
  isPresidential?: boolean;
  names: MilitaryUnitName[];
}

export const militaryUnits: MilitaryUnit[] = [
  {
    number: 3,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.ASSAULT,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [],
  },
  {
    number: 5,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.ASSAULT,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.GEOGRAPHIC,
        value: 'Київська',
      },
    ],
  },
  {
    number: 10,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MOUNTAIN_ASSAULT,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.QUOTED_NAME,
        value: 'Едельвейс',
      },
    ],
  },
  {
    number: 24,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MECHANIZED,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'короля Данила',
      },
    ],
  },
  {
    number: 28,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MECHANIZED,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'Лицарів Зимового Походу',
      },
    ],
  },
  {
    number: 30,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MECHANIZED,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'князя Костянтина Острозького',
      },
    ],
  },
  {
    number: 47,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MECHANIZED,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.QUOTED_NAME,
        value: 'Маґура',
      },
    ],
  },
  {
    number: 53,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MECHANIZED,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'князя Володимира Мономаха',
      },
    ],
  },
  {
    number: 54,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MECHANIZED,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'гетьмана Івана Мазепи',
      },
    ],
  },
  {
    number: 57,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MOTORIZED_INFANTRY,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'кошового отамана Костя Гордієнка',
      },
    ],
  },
  {
    number: 58,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MOTORIZED_INFANTRY,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'гетьмана Івана Виговського',
      },
    ],
  },
  {
    number: 72,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MECHANIZED,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'Чорних Запорожців',
      },
    ],
  },
  {
    number: 92,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.ASSAULT,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'кошового отамана Івана Сірка',
      },
    ],
  },
  {
    number: 93,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MECHANIZED,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.QUOTED_NAME,
        value: 'Холодний Яр',
      },
    ],
  },
  {
    number: 128,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MOUNTAIN_ASSAULT,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.GEOGRAPHIC,
        value: 'Закарпатська',
      },
    ],
  },

  // Десантно-штурмові війська

  {
    number: 25,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.AIRBORNE,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.GEOGRAPHIC,
        value: 'Січеславська',
      },
    ],
  },
  {
    number: 46,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.AIRMOBILE,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.GEOGRAPHIC,
        value: 'Подільська',
      },
    ],
  },
  {
    number: 79,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.AIR_ASSAULT,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.GEOGRAPHIC,
        value: 'Таврійська',
      },
    ],
  },
  {
    number: 80,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.AIR_ASSAULT,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.GEOGRAPHIC,
        value: 'Галицька',
      },
    ],
  },
  {
    number: 81,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.AIRMOBILE,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.GEOGRAPHIC,
        value: 'Слобожанська',
      },
    ],
  },
  {
    number: 82,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.AIR_ASSAULT,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.GEOGRAPHIC,
        value: 'Буковинська',
      },
    ],
  },
  {
    number: 95,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.AIR_ASSAULT,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.GEOGRAPHIC,
        value: 'Поліська',
      },
    ],
  },

  // Морська піхота

  {
    number: 35,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MARINE,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'контр-адмірала Михайла Остроградського',
      },
    ],
  },
  {
    number: 36,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MARINE,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'контр-адмірала Михайла Білинського',
      },
    ],
  },
  {
    number: 37,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MARINE,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [],
  },
  {
    number: 38,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.MARINE,
    branch: MilitaryUnitBranch.ARMED_FORCES,
    isSeparate: true,
    names: [
      {
        type: MilitaryUnitNameType.NAMED_AFTER,
        value: 'гетьмана Петра Сагайдачного',
      },
    ],
  },

  // Національна гвардія України

  {
    number: 1,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.OPERATIONAL_PURPOSE,
    branch: MilitaryUnitBranch.NATIONAL_GUARD,
    isPresidential: true,
    names: [
      {
        type: MilitaryUnitNameType.QUOTED_NAME,
        value: 'Буревій',
      },
    ],
  },
  {
    number: 4,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.OPERATIONAL_PURPOSE,
    branch: MilitaryUnitBranch.NATIONAL_GUARD,
    names: [
      {
        type: MilitaryUnitNameType.QUOTED_NAME,
        value: 'Рубіж',
      },
    ],
  },
  {
    number: 12,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.SPECIAL_PURPOSE,
    branch: MilitaryUnitBranch.NATIONAL_GUARD,
    names: [
      {
        type: MilitaryUnitNameType.QUOTED_NAME,
        value: 'Азов',
      },
    ],
  },
  {
    number: 13,
    echelon: MilitaryUnitEchelon.BRIGADE,
    specialization: MilitaryUnitSpecialization.OPERATIONAL_PURPOSE,
    branch: MilitaryUnitBranch.NATIONAL_GUARD,
    names: [
      {
        type: MilitaryUnitNameType.QUOTED_NAME,
        value: 'Хартія',
      },
    ],
  },
];
