import type { ServiceSlug } from "@/config/services";

/**
 * Rich copy for the four service detail pages and the /services directory.
 *
 * Scope is restricted to what the existing site lists (furnaces, air
 * conditioning, water heaters) plus the documented heat pump project. Do not
 * add hours, prices, free estimates, certifications, response times,
 * emergency availability, reviews, totals, savings or rankings.
 *
 * Symptom copy is descriptive. It never tells a visitor to work on gas,
 * electrical or refrigerant parts. The only homeowner checks suggested are the
 * thermostat (settings, batteries), the equipment switch or breaker, and the
 * filter.
 */

export interface ServiceSymptom {
  /** Stable fragment id, e.g. "short-cycling". Unique per page. */
  id: string;
  title: string;
  /** What the visitor is noticing and what it can point to. Descriptive only. */
  description: string;
  /** When to stop checking and call. */
  whenToCall: string;
}

export interface BuyingQuestion {
  question: string;
  answer: string;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface EquipmentType {
  name: string;
  description: string;
}

export interface ScopeGroups {
  repair: string[];
  maintenance: string[];
  /** Replacement and new installation. */
  installation: string[];
  /** Efficiency upgrades and integration with other equipment. */
  efficiency: string[];
}

/** Labels used by the /services "by need" paths. */
export interface NeedLabels {
  repair: string;
  maintenance: string;
  replace: string;
}

export interface ServicePageContent {
  slug: ServiceSlug;
  h1: string;
  /** Page title without the site name. */
  metaTitle: string;
  /** <= 158 characters. */
  metaDescription: string;
  /** Short line above the H1. */
  eyebrow: string;
  /** One or two short paragraphs. */
  intro: string[];
  /** Equipment explicitly in scope, with a plain explanation. */
  types: { heading: string; items: EquipmentType[] };
  symptomsHeading: string;
  symptomsIntro: string;
  symptoms: ServiceSymptom[];
  /** Safe checks a homeowner can make before calling. */
  homeownerChecks: string[];
  buyingHeading: string;
  buyingIntro: string;
  buyingQuestions: BuyingQuestion[];
  scope: ScopeGroups;
  relatedServices: ServiceSlug[];
  faqHeading: string;
  faqs: ServiceFaq[];
  needs: NeedLabels;
  /** A documented project the page is anchored in (shown only if published). */
  anchorProject?: { slug: string; lead: string };
  /** Optional clarifying note shown beside the equipment types. */
  note?: string;
}

/** Fragment ids used on every service detail page (and linked from /services). */
export const SERVICE_SECTION_IDS = {
  symptoms: "symptoms",
  safety: "before-you-call",
  buying: "buying-questions",
  scope: "scope",
  scopeRepair: "scope-repair",
  scopeMaintenance: "scope-maintenance",
  scopeInstallation: "scope-installation",
  scopeEfficiency: "scope-efficiency",
  projects: "projects",
  faq: "faq",
  related: "related-services",
} as const;

const furnaces: ServicePageContent = {
  slug: "furnaces",
  h1: "Furnace repair, maintenance and replacement",
  metaTitle: "Furnace repair, maintenance and replacement",
  metaDescription:
    "Gas and electric furnace repair for no heat, short cycling and unusual noises, plus seasonal maintenance and furnace replacement for homes and businesses.",
  eyebrow: "Furnaces · gas and electric",
  intro: [
    "Don works on gas, electric and high-efficiency furnaces in homes and commercial buildings: tracking down why there is no heat, fixing ignition, blower and thermostat problems, cleaning and inspecting the furnace before winter, and replacing a furnace that is no longer worth repairing.",
    "If your furnace has stopped and the house is getting cold, call. If you are planning a replacement, the buying questions below are a good place to start before you request an estimate.",
  ],
  types: {
    heading: "Furnaces Don works on",
    items: [
      {
        name: "Gas furnaces",
        description:
          "Burn natural gas to heat air that the blower pushes through your ducts. Most Ontario homes with ductwork heat this way.",
      },
      {
        name: "Electric furnaces",
        description:
          "Heat air with electric elements instead of a gas burner. There is no gas line or venting, but the blower and ducts work the same way.",
      },
      {
        name: "High-efficiency furnaces",
        description:
          "Gas furnaces designed to get more heat from the same fuel. They vent differently from older models, which matters when replacing one.",
      },
    ],
  },
  symptomsHeading: "Furnace not heating? Common signs and what they can mean",
  symptomsIntro:
    "These descriptions help you explain what you are seeing when you call. They are not repair instructions: anything involving gas, burners or wiring is a job for Don.",
  symptoms: [
    {
      id: "no-heat",
      title: "No heat, or the air from the vents is cool",
      description:
        "The furnace may not be starting at all, or it may start and shut off before it heats. Causes range from a thermostat setting or a tripped switch to an ignition, flame sensor or control problem inside the furnace.",
      whenToCall:
        "Call Don if the thermostat is set to heat, the furnace switch and breaker are on, the filter is not clogged, and there is still no heat.",
    },
    {
      id: "short-cycling",
      title: "Short cycling: the furnace turns on and off often",
      description:
        "Short cycling means the furnace runs for a short time, shuts off, then starts again soon after, without the house reaching the set temperature. It can come from restricted airflow (often a dirty filter), a thermostat problem, overheating, or a furnace that is too large for the space it heats.",
      whenToCall:
        "Call if short cycling continues after you have replaced a dirty filter, or if it comes with a burning smell or the furnace shutting down completely.",
    },
    {
      id: "unusual-noises",
      title: "Banging, squealing, rattling or humming",
      description:
        "New noises usually point to a part that is wearing or loose: a blower motor or belt, a panel, or delayed ignition when the burners light. Noting when the sound happens (at start-up, while running, at shut-off) helps narrow it down.",
      whenToCall:
        "Call when a noise is new, getting louder, or happens every time the furnace starts. Do not open the furnace cabinet to look.",
    },
    {
      id: "uneven-heat",
      title: "Some rooms are warm, others stay cold",
      description:
        "Uneven heat can come from blocked or closed vents, leaking or poorly insulated ductwork, a weak blower, or a thermostat placed where it reads the wrong temperature.",
      whenToCall:
        "Call if opening the vents in the cold rooms does not help. Don can check the blower and ductwork and talk through sealing ducts or zoning.",
    },
    {
      id: "thermostat-not-responding",
      title: "The thermostat does not seem to control the furnace",
      description:
        "A blank screen, a furnace that ignores setting changes, or one that will not stop running can be a thermostat, wiring or control-board issue.",
      whenToCall:
        "Check the batteries and the heat setting first. Call if the furnace still does not respond; thermostat wiring is part of the furnace's electrical system.",
    },
  ],
  homeownerChecks: [
    "Thermostat: set to heat, set above the current room temperature, and fresh batteries if it uses them.",
    "Furnace switch and breaker: the service switch near the furnace is on, and the furnace breaker in the panel has not tripped. Reset a tripped breaker once only; if it trips again, leave it off and call.",
    "Filter: a filter caked with dust can stop airflow and make the furnace shut itself off. Replace it if it is dirty.",
  ],
  buyingHeading: "Replacing a furnace: questions to ask first",
  buyingIntro:
    "A replacement is a bigger decision than a repair. These are the questions worth asking before you request an estimate, so the conversation with Don starts in the right place.",
  buyingQuestions: [
    {
      question: "Is it time to replace, or is a repair still reasonable?",
      answer:
        "That depends on the furnace's age and condition, how often it has needed repairs, and the cost of the current repair. Don can tell you what he finds and what the realistic options are.",
    },
    {
      question: "Gas or electric?",
      answer:
        "Most homes keep the fuel they already have, because switching affects gas lines, venting and electrical capacity. If you are considering a change, raise it when you ask for an estimate.",
    },
    {
      question: "What size of furnace does the house need?",
      answer:
        "A furnace that is too large tends to short cycle; one that is too small runs constantly on cold days. Sizing should be based on the house, not on the old furnace's label.",
    },
    {
      question: "Should I consider a high-efficiency model?",
      answer:
        "High-efficiency furnaces use less fuel for the same heat but have different venting needs. Ask Don whether your home suits one and what the installation would involve.",
    },
    {
      question: "Would a heat pump work alongside a new furnace?",
      answer:
        "A furnace can be paired with an air-source heat pump so the two share the heating. If you are also thinking about cooling, it is worth discussing both at once.",
    },
    {
      question: "Is the ductwork and thermostat ready for it?",
      answer:
        "Leaky or undersized ducts can undo the benefit of a new furnace. A replacement is also a good time to look at duct sealing and a smart thermostat.",
    },
  ],
  scope: {
    repair: [
      "Diagnosing no heat, frequent cycling (short cycling) and unusual noises",
      "Repairing or replacing ignition systems",
      "Repairing or replacing thermostats",
      "Repairing or replacing blower motors",
    ],
    maintenance: [
      "Cleaning and inspecting burners, heat exchangers and blowers",
      "Checking and replacing filters",
    ],
    installation: [
      "Installing gas, electric and high-efficiency furnaces",
      "Replacing an existing furnace",
    ],
    efficiency: [
      "High-efficiency furnace upgrades",
      "Sealing and insulating ductwork",
      "Integrating a furnace with a heat pump or zoned heating",
      "Smart and Wi-Fi thermostats",
    ],
  },
  relatedServices: ["heat-pumps", "air-conditioning", "water-heaters"],
  faqHeading: "Furnace questions",
  faqs: [
    {
      q: "What should I do if I smell gas near the furnace?",
      a: "Leave the building right away and call your gas utility’s emergency line or 911 from outside. Do not switch lights or appliances on or off on the way out. Call Don once the utility or fire service says it is safe.",
    },
    {
      q: "Why does my furnace keep turning on and off?",
      a: "That is called short cycling. A clogged filter is a common cause and is safe for you to check. If a clean filter does not fix it, the cause may be a thermostat, sensor or sizing issue that Don will need to diagnose.",
    },
    {
      q: "How often should a furnace be maintained?",
      a: "A yearly cleaning and inspection, ideally before the heating season, lets problems with the burners, heat exchanger or blower show up before a cold night. Filters need checking more often.",
    },
    {
      q: "Does Don work on furnaces in commercial buildings?",
      a: "Yes. Don works on heating in homes and businesses. Building managers can describe the property when they request service, or see the commercial page.",
    },
  ],
  needs: {
    repair: "Furnace not heating, short cycling or noisy",
    maintenance: "Furnace cleaning, inspection and filters",
    replace: "Replacing a furnace: questions to ask",
  },
};

const airConditioning: ServicePageContent = {
  slug: "air-conditioning",
  h1: "Air conditioning repair, maintenance and installation",
  metaTitle: "Air conditioning repair, maintenance and installation",
  metaDescription:
    "Central and ductless air conditioner repair for poor cooling, weak airflow, leaks and noises, plus seasonal maintenance and properly sized new installations.",
  eyebrow: "Air conditioning · central and ductless",
  intro: [
    "Don installs, repairs and maintains central air conditioners and ductless mini-splits for homes and businesses, along with window units. That covers sizing a new system to the space, finding out why an existing one is not cooling, and the seasonal cleaning that keeps it running.",
    "If your air conditioner has stopped cooling, call. If you are choosing between central air and a ductless system, the buying questions below walk through the differences.",
  ],
  types: {
    heading: "Air conditioning Don works on",
    items: [
      {
        name: "Central air conditioners",
        description:
          "An outdoor unit connected to a coil at the furnace or air handler, cooling the whole house through the existing ductwork.",
      },
      {
        name: "Ductless mini-splits",
        description:
          "A wall-mounted indoor unit (or several) connected to an outdoor unit by refrigerant lines. Useful where there are no ducts, or for an addition or a single room.",
      },
      {
        name: "Window and commercial rooftop units",
        description:
          "Window units for single rooms, and rooftop units that serve commercial buildings from above.",
      },
    ],
  },
  symptomsHeading: "Air conditioner not cooling? Common signs and what they can mean",
  symptomsIntro:
    "Use these to describe the problem when you call. Air conditioners contain refrigerant under pressure and high-voltage parts, so the fixes themselves are for Don.",
  symptoms: [
    {
      id: "poor-cooling",
      title: "The house is not cooling, or the air feels warm",
      description:
        "The system may be running without removing enough heat. Common causes include a dirty filter or coil, low refrigerant from a leak, a failing outdoor fan, or a compressor that is not starting.",
      whenToCall:
        "Call if the thermostat is set to cool, the breaker is on, the filter is clean, and the air from the vents is still not cool.",
    },
    {
      id: "weak-airflow",
      title: "Weak airflow from the vents",
      description:
        "Cool air is coming out, but only faintly. Weak airflow often comes from a clogged filter, a dirty or iced-up indoor coil, a blower problem, or leaking or blocked ductwork. In a ductless system, a dirty indoor-unit filter has the same effect.",
      whenToCall:
        "Replace a dirty filter first. Call if airflow stays weak, or if you see ice on the refrigerant lines or indoor coil; switch the cooling off and leave the ice for Don to assess.",
    },
    {
      id: "leaks",
      title: "Water or refrigerant leaks",
      description:
        "Water pooling near the indoor unit usually points to a blocked condensate drain or a frozen coil. An oily residue or hissing near the lines can mean a refrigerant leak, which needs a technician to locate and repair.",
      whenToCall:
        "Call for any leak you cannot explain. Do not try to add refrigerant or open the lines yourself.",
    },
    {
      id: "strange-noises",
      title: "Buzzing, grinding or rattling",
      description:
        "Noises from the outdoor unit can come from the fan motor, the compressor or loose panels; noises inside often come from the blower. Buzzing with no cooling can point to an electrical part that is failing.",
      whenToCall:
        "Call when a noise is new or gets worse. Switch the system off at the thermostat if it is grinding or the outdoor unit is buzzing without its fan turning.",
    },
    {
      id: "frequent-cycling",
      title: "Turning on and off often, or running non-stop",
      description:
        "An air conditioner that cycles every few minutes, or never shuts off on a mild day, may be the wrong size for the space, low on refrigerant, or responding to a thermostat in the wrong spot.",
      whenToCall:
        "Call if it continues after checking the thermostat setting and the filter.",
    },
  ],
  homeownerChecks: [
    "Thermostat: set to cool, set below the current room temperature, and fresh batteries if it uses them.",
    "Breaker and switch: the air conditioner's breaker has not tripped and the outdoor disconnect has not been switched off. Reset a tripped breaker once only; if it trips again, leave it off and call.",
    "Filter: replace a dirty furnace or air-handler filter, or clean the filter in a ductless indoor unit as its manual describes.",
  ],
  buyingHeading: "Choosing an air conditioner: questions to ask first",
  buyingIntro:
    "Before you request an estimate for a new or replacement system, these questions help you and Don land on the right type and size.",
  buyingQuestions: [
    {
      question: "Central air or ductless?",
      answer:
        "If the house already has ductwork in good shape, central air uses it to cool every room. Ductless mini-splits suit homes without ducts, additions, finished basements and rooms that the ducts do not reach well.",
    },
    {
      question: "What size does the space need?",
      answer:
        "Sizing should match the home or business: the floor area, windows, insulation and how the space is used. An oversized unit cycles too often and leaves the air clammy; an undersized one runs constantly.",
    },
    {
      question: "Is the existing ductwork ready?",
      answer:
        "Leaky or undersized ducts cause weak airflow and uneven cooling no matter how good the new unit is. Duct sealing can be part of the same job.",
    },
    {
      question: "Where will the outdoor unit go?",
      answer:
        "It needs clear airflow around it, a stable base and a reasonable route for the refrigerant lines. Noise near bedrooms, decks and neighbours is worth thinking about too.",
    },
    {
      question: "Should I go with a more efficient model?",
      answer:
        "Efficient models cost less to run. Ask Don to compare options for your home and whether a heat pump, which also heats, is worth considering instead.",
    },
    {
      question: "What about air quality and thermostat control?",
      answer:
        "A new system is a good time to add a smart thermostat, or to ask about air purifiers, UV lights or better ventilation.",
    },
  ],
  scope: {
    repair: [
      "Diagnosing poor cooling, weak airflow, leaks and strange noises",
      "Repairing compressors, fans and refrigerant lines",
    ],
    maintenance: [
      "Cleaning and replacing filters",
      "Inspecting coils, refrigerant levels and electrical components",
    ],
    installation: [
      "Installing central air conditioners",
      "Installing ductless mini-splits and window units",
      "Sizing the system to the home or business",
    ],
    efficiency: [
      "Duct sealing",
      "Energy-efficient models",
      "Smart thermostat integration",
      "Indoor air quality: air purifiers, UV lights and ventilation",
    ],
  },
  relatedServices: ["heat-pumps", "furnaces", "water-heaters"],
  faqHeading: "Air conditioning questions",
  faqs: [
    {
      q: "Why is my air conditioner running but the airflow is weak?",
      a: "The most common cause is a clogged filter, which you can safely replace. If airflow is still weak, the indoor coil may be dirty or frozen, the blower may be failing, or the ducts may be leaking; those need Don to check.",
    },
    {
      q: "Can a ductless mini-split cool a whole house?",
      a: "It can, with indoor units in the main areas, but it depends on the layout. For a home with good ductwork, central air is often simpler. Ask Don which suits your house.",
    },
    {
      q: "Is there ice on my air conditioner a problem?",
      a: "Yes. Ice on the lines or coil usually means restricted airflow or low refrigerant. Switch the cooling off, check the filter, and call Don. Do not chip the ice off.",
    },
    {
      q: "Does Don service commercial rooftop units?",
      a: "Don has completed rooftop air-conditioning work for a commercial building. Building managers can use the commercial page to describe the property.",
    },
  ],
  needs: {
    repair: "Air conditioner not cooling or weak airflow",
    maintenance: "AC cleaning, coil and refrigerant checks",
    replace: "Choosing central or ductless AC",
  },
};

const waterHeaters: ServicePageContent = {
  slug: "water-heaters",
  h1: "Water heater repair, maintenance and replacement",
  metaTitle: "Water heater repair, maintenance and replacement",
  metaDescription:
    "Tank, tankless and heat-pump water heater repair for no hot water, leaks and noises, plus flushing, anode rod replacement and new water heater installation.",
  eyebrow: "Water heaters · tank, tankless and heat-pump",
  intro: [
    "Don installs, repairs and maintains tank, tankless and heat-pump water heaters, and solar water heaters. That includes finding out why there is no hot water, replacing heating elements, thermostats and relief valves, flushing out sediment, and choosing a replacement that suits how your household uses hot water.",
    "If you have no hot water or the tank is leaking, call. If you are thinking about switching to tankless or a heat-pump water heater, start with the buying questions below.",
  ],
  types: {
    heading: "Water heaters Don works on",
    items: [
      {
        name: "Tank water heaters",
        description:
          "Keep a tank of water hot and ready, heated by gas or electricity. The most common type in Ontario homes.",
      },
      {
        name: "Tankless water heaters",
        description:
          "Heat water only as you use it, so there is no tank to keep hot. They mount on the wall and take up less space.",
      },
      {
        name: "Heat-pump water heaters",
        description:
          "Tank water heaters that use a small heat pump to pull heat from the surrounding air into the water, with electric elements as backup.",
      },
    ],
  },
  note: "A heat-pump water heater only heats water. It is a different appliance from a heat pump that heats and cools your home; that is covered on the heat pumps page.",
  symptomsHeading: "No hot water? Common signs and what they can mean",
  symptomsIntro:
    "These help you describe what is happening when you call. Gas burners, electrical elements and the pressure-relief valve are for Don to work on.",
  symptoms: [
    {
      id: "no-hot-water",
      title: "No hot water, or it runs out quickly",
      description:
        "On an electric tank, a failed heating element or thermostat is a common cause. On a gas tank, it can be the ignition or gas control. Hot water that runs out fast can mean sediment has built up in the tank, or that the heater is too small for the household.",
      whenToCall:
        "For an electric water heater, check whether its breaker has tripped. Call if the breaker is on and there is still no hot water, or for any gas water heater that has stopped heating.",
    },
    {
      id: "leaks",
      title: "Water around the base of the tank",
      description:
        "A leak may come from a fitting, the drain valve, the pressure-relief valve or its pipe, or the tank itself. A leak from the tank body usually means the tank is corroding and will need replacing.",
      whenToCall:
        "Call as soon as you see water. Keep people and stored items away from the area. Do not try to open or adjust the pressure-relief valve.",
    },
    {
      id: "strange-noises",
      title: "Popping, rumbling or crackling",
      description:
        "These sounds are usually sediment at the bottom of the tank, which water boils through as it heats. It reduces how much hot water you get and wears the tank. Flushing can help if it is caught early.",
      whenToCall:
        "Call to arrange a flush and inspection, especially if the noise is getting louder.",
    },
    {
      id: "discoloured-water",
      title: "Rusty colour or a sulphur smell in the hot water",
      description:
        "Discoloured hot water can mean the anode rod, which protects the tank from corrosion, is used up, or that parts of the tank or pipes are corroding. A rotten-egg smell only in the hot water is usually a reaction inside the tank rather than gas.",
      whenToCall:
        "Call to have the anode rod and tank inspected. If you smell rotten eggs in the air near the heater rather than in the water, treat it as a possible gas leak (see below).",
    },
  ],
  homeownerChecks: [
    "Electric water heaters: check whether the water heater breaker in the panel has tripped. Reset it once only; if it trips again, leave it off and call. Do not open the heater's access panels.",
    "Leaks: note where the water seems to come from and keep the area clear. You do not need to touch the heater to describe it.",
    "Temperature: if the water is too hot or not hot enough, mention it when you call rather than adjusting internal thermostats.",
  ],
  buyingHeading: "Replacing a water heater: questions to ask first",
  buyingIntro:
    "Whether you replace like for like or change type, these questions are worth working through before you request an estimate.",
  buyingQuestions: [
    {
      question: "Tank or tankless?",
      answer:
        "A tank stores hot water and is simpler to replace like for like. A tankless unit heats water on demand, frees up floor space and does not run out, but it has different gas, venting or electrical requirements.",
    },
    {
      question: "Would a heat-pump water heater suit the house?",
      answer:
        "Heat-pump water heaters need space around them and pull heat from the room they are in, so a basement or utility room usually suits them best. Ask Don whether your location works.",
    },
    {
      question: "How much hot water does the household use?",
      answer:
        "The number of people, bathrooms and appliances running at once decides the size of tank or the capacity of tankless unit you need.",
    },
    {
      question: "Gas or electric?",
      answer:
        "Staying with the same fuel is usually simplest. Switching affects gas lines, venting and electrical capacity, so raise it early.",
    },
    {
      question: "What about insulation, timers and smart controls?",
      answer:
        "Insulating the tank and pipes, adding a timer, or choosing a smart water heater can all reduce wasted heat. They are easy to add at installation.",
    },
  ],
  scope: {
    repair: [
      "Diagnosing no hot water, leaks and strange noises",
      "Repairing or replacing heating elements",
      "Repairing or replacing thermostats",
      "Repairing or replacing pressure-relief valves",
    ],
    maintenance: [
      "Flushing sediment from the tank",
      "Inspecting and replacing anode rods and corroded parts",
    ],
    installation: [
      "Installing tank and tankless water heaters",
      "Installing heat-pump and solar water heaters",
      "Replacing an existing water heater",
    ],
    efficiency: [
      "Insulating tanks and pipes",
      "Installing timers",
      "Smart water heaters",
    ],
  },
  relatedServices: ["furnaces", "heat-pumps", "air-conditioning"],
  faqHeading: "Water heater questions",
  faqs: [
    {
      q: "Is a heat-pump water heater the same as a heat pump?",
      a: "No. A heat-pump water heater heats only your water, using a small heat pump built into the tank. A heat pump for your home heats and cools the living space. Don works on both.",
    },
    {
      q: "Why is my water heater making popping noises?",
      a: "Usually sediment in the bottom of the tank. Flushing the tank can reduce it; Don can flush and inspect it at the same visit.",
    },
    {
      q: "My water heater is leaking. Is it dangerous?",
      a: "Water damage is the main risk, so call promptly and keep the area clear. If you also smell gas near a gas water heater, leave the building and call the gas utility’s emergency line or 911 from outside first.",
    },
    {
      q: "What does an anode rod do?",
      a: "It is a metal rod inside the tank that corrodes in place of the tank itself. When it is used up, the tank starts to corrode, so checking and replacing it is part of maintenance.",
    },
  ],
  needs: {
    repair: "No hot water or a leaking water heater",
    maintenance: "Water heater flushing and anode rods",
    replace: "Tank, tankless or heat-pump water heater?",
  },
};

const heatPumps: ServicePageContent = {
  slug: "heat-pumps",
  h1: "Heat pump installation and service",
  metaTitle: "Heat pump installation and service",
  metaDescription:
    "Air-source heat pumps that heat and cool your home, including pairing a heat pump with an existing furnace. Questions to ask before you request an estimate.",
  eyebrow: "Heat pumps · heating and cooling",
  intro: [
    "A heat pump heats your home in cold weather and cools it in warm weather by moving heat between the outdoors and the house, instead of burning fuel to make heat. Don installs air-source heat pumps and connects them to the rest of the system, including pairing a heat pump with an existing furnace.",
    "Most people come to heat pumps while replacing an air conditioner or a furnace. The questions below cover what to think about before you request an estimate.",
  ],
  types: {
    heading: "How a heat pump fits into a home",
    items: [
      {
        name: "Air-source heat pumps",
        description:
          "An outdoor unit that looks like an air conditioner, connected to an indoor coil or indoor units. In summer it works like an air conditioner; in winter it runs in reverse to bring heat in.",
      },
      {
        name: "Heat pumps paired with a furnace",
        description:
          "The heat pump handles cooling and much of the heating, and the furnace takes over when it is very cold outside. The two share the existing ductwork and thermostat.",
      },
    ],
  },
  note: "This page is about heat pumps that heat and cool the living space. A heat-pump water heater only heats water and is covered on the water heaters page.",
  anchorProject: {
    slug: "brampton-home-heat-pump-installation",
    lead: "Don’s documented heat pump work includes an installation in a Brampton home.",
  },
  symptomsHeading: "Heat pump not heating or cooling? Common signs",
  symptomsIntro:
    "Heat pumps behave differently from furnaces, so some things that look like faults are normal. These descriptions help you tell the difference and explain what you are seeing. Refrigerant and electrical work is for Don.",
  symptoms: [
    {
      id: "not-heating",
      title: "Not heating enough, or the air feels lukewarm",
      description:
        "Air from a heat pump is warm but not as hot as air from a gas furnace, which is normal. If rooms are not reaching the set temperature, the cause may be a dirty filter, a thermostat set-up issue, a refrigerant problem, or very cold weather where backup heat should be taking over.",
      whenToCall:
        "Call if the house is not keeping up with the thermostat after you have checked the setting and the filter.",
    },
    {
      id: "not-cooling",
      title: "Not cooling, or weak airflow in summer",
      description:
        "In cooling mode a heat pump has the same weak points as an air conditioner: filters, coils, refrigerant and the outdoor fan.",
      whenToCall:
        "Call if airflow or cooling stays weak with a clean filter and the thermostat set to cool.",
    },
    {
      id: "ice-on-outdoor-unit",
      title: "Frost or ice on the outdoor unit",
      description:
        "Light frost in winter is normal; the heat pump runs a defrost cycle to clear it, sometimes with steam. Ice that builds up and stays, or a unit encased in ice, means the defrost is not working or airflow is blocked.",
      whenToCall:
        "Call if heavy ice does not clear within a few hours. Do not chip or hose ice off the coil.",
    },
    {
      id: "running-constantly",
      title: "Running for long periods",
      description:
        "Heat pumps run longer, gentler cycles than furnaces, especially in cold weather, so long run times alone are not a fault. Running constantly without keeping the house comfortable is worth a call.",
      whenToCall:
        "Call if the system runs non-stop and the house is still too cold or too warm.",
    },
  ],
  homeownerChecks: [
    "Thermostat: check it is set to the right mode (heat, cool or auto) and temperature, and has fresh batteries if it uses them.",
    "Breaker and switch: the heat pump and furnace breakers are on. Reset a tripped breaker once only; if it trips again, leave it off and call.",
    "Filter: replace a dirty filter at the furnace or air handler. Keep snow and leaves clear of the outdoor unit without touching the coil.",
  ],
  buyingHeading: "Considering a heat pump: questions to ask first",
  buyingIntro:
    "A heat pump changes how your home is heated, so it is worth a conversation before an estimate. These are the questions that shape the job.",
  buyingQuestions: [
    {
      question: "Ducted or ductless?",
      answer:
        "If the house has ductwork, a ducted heat pump uses it like central air. Homes without ducts, or rooms the ducts do not reach, can use ductless indoor units instead.",
    },
    {
      question: "Keep the existing furnace, or replace it?",
      answer:
        "Many homes keep a working furnace and add a heat pump so the two share the heating. Others replace both together. Don can look at the furnace’s age and condition and talk through each option.",
    },
    {
      question: "Does the electrical panel have capacity?",
      answer:
        "A heat pump needs its own electrical circuit, and some older panels do not have room. This is checked before installation, so any electrical changes are known up front.",
    },
    {
      question: "Where will the outdoor unit go?",
      answer:
        "It needs clear airflow, a stable base raised above snow, a route for the refrigerant lines, and somewhere the defrost water can drain without icing a walkway.",
    },
    {
      question: "How does it handle an Ontario winter?",
      answer:
        "Heat pumps are designed to keep heating as it gets colder, with cold-climate models built for lower temperatures. On the coldest days, many Ontario homes rely on a furnace or other backup heat. Ask Don how the heat pump and backup would share the work in your house.",
    },
    {
      question: "Are there rebates?",
      answer:
        "Rebate and incentive programs change over time. Ask about current rebate programs when you request an estimate, and check the program’s own rules before you commit.",
    },
  ],
  scope: {
    repair: [
      "Diagnosing heating and cooling problems",
      "Repairing fans, refrigerant lines and electrical components",
    ],
    maintenance: [
      "Cleaning and replacing filters",
      "Inspecting coils, refrigerant levels and electrical components",
    ],
    installation: [
      "Installing air-source heat pumps",
      "Replacing an air conditioner with a heat pump",
    ],
    efficiency: [
      "Integrating a heat pump with an existing furnace",
      "Zoned heating",
      "Smart thermostat integration",
      "Duct sealing",
    ],
  },
  relatedServices: ["furnaces", "air-conditioning", "water-heaters"],
  faqHeading: "Heat pump questions",
  faqs: [
    {
      q: "Can a heat pump replace my air conditioner?",
      a: "Yes. A heat pump cools like an air conditioner and also heats. If your air conditioner is due for replacement, it is worth asking about a heat pump at the same time.",
    },
    {
      q: "Can I keep my furnace if I get a heat pump?",
      a: "Often, yes. A heat pump can be paired with an existing furnace so the furnace takes over on the coldest days. Whether that suits your furnace depends on its age and condition.",
    },
    {
      q: "Why is steam coming off my heat pump in winter?",
      a: "That is usually the defrost cycle melting frost off the outdoor coil, which is normal. Call if the unit stays covered in ice.",
    },
    {
      q: "Is a heat pump the same as a heat-pump water heater?",
      a: "No. A heat pump heats and cools your home; a heat-pump water heater only heats water. Don works on both.",
    },
  ],
  needs: {
    repair: "Heat pump not heating or cooling",
    maintenance: "Heat pump filters, coils and checks",
    replace: "Considering a heat pump: questions to ask",
  },
};

export const servicePages: Record<ServiceSlug, ServicePageContent> = {
  furnaces,
  "air-conditioning": airConditioning,
  "water-heaters": waterHeaters,
  "heat-pumps": heatPumps,
};

export function getServicePage(slug: string): ServicePageContent | null {
  return Object.prototype.hasOwnProperty.call(servicePages, slug) ? servicePages[slug as ServiceSlug] : null;
}

/** Safety guidance shown on every service page. */
export const gasAndCoSafety = {
  heading: "Smell gas or hear a carbon monoxide alarm?",
  body: "Leave the building now and take everyone with you. From outside, call your gas utility’s emergency line or 911. Do not switch lights or appliances on or off on the way out. Call Don once the utility or fire service says it is safe to go back in.",
} as const;
